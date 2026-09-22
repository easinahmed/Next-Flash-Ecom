const CourierSetting = require('../models/CourierSetting');
const Order = require('../models/Order');

// Fetch all courier settings
const getCourierSettings = async (req, res) => {
  try {
    let steadfast = await CourierSetting.findOne({ provider: 'steadfast' });
    if (!steadfast) {
      steadfast = await CourierSetting.create({
        provider: 'steadfast',
        baseUrl: 'https://portal.steadfast.com.bd/api/v1',
      });
    }

    let pathao = await CourierSetting.findOne({ provider: 'pathao' });
    if (!pathao) {
      pathao = await CourierSetting.create({
        provider: 'pathao',
        pathaoBaseUrl: 'https://api-hermes.pathao.com',
      });
    }

    res.json({ steadfast, pathao });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courier settings', error: error.message });
  }
};

// Update courier setting by provider
const updateCourierSetting = async (req, res) => {
  try {
    const { provider } = req.params;
    if (!['steadfast', 'pathao'].includes(provider)) {
      return res.status(400).json({ message: 'Invalid courier provider' });
    }

    const payload = { ...req.body };

    // If marked as default, unmark others
    if (payload.isDefault) {
      await CourierSetting.updateMany({ provider: { $ne: provider } }, { isDefault: false });
    }

    const setting = await CourierSetting.findOneAndUpdate(
      { provider },
      payload,
      { new: true, upsert: true, runValidators: true }
    );

    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update courier setting', error: error.message });
  }
};

// Test Courier API Connection
const testCourierConnection = async (req, res) => {
  try {
    const { provider } = req.params;
    const setting = await CourierSetting.findOne({ provider });

    if (!setting) {
      return res.status(404).json({ message: 'Courier provider settings not found' });
    }

    if (provider === 'steadfast') {
      if (!setting.apiKey || !setting.secretKey) {
        return res.status(400).json({ message: 'Steadfast API Key and Secret Key are required' });
      }

      // Perform a lightweight ping/balance request to Steadfast API
      const response = await fetch(`${setting.baseUrl}/status_by_cid/test_ping`, {
        method: 'GET',
        headers: {
          'Api-Key': setting.apiKey,
          'Secret-Key': setting.secretKey,
          'Content-Type': 'application/json',
        },
      });

      // Steadfast responds even for non-existent CID with 200 or 404 JSON response when credentials are valid
      if (response.status === 200 || response.status === 404) {
        return res.json({ success: true, message: 'Steadfast API credentials verified successfully!' });
      } else {
        const errorText = await response.text();
        return res.status(400).json({ success: false, message: `Steadfast connection failed: ${errorText}` });
      }
    }

    if (provider === 'pathao') {
      if (!setting.clientId || !setting.clientSecret || !setting.username || !setting.password) {
        return res.status(400).json({ message: 'Pathao Client ID, Secret, Username, and Password are required' });
      }

      // Request Auth Token from Pathao
      const tokenRes = await fetch(`${setting.pathaoBaseUrl}/aladdin/api/v1/issue-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: setting.clientId,
          client_secret: setting.clientSecret,
          username: setting.username,
          password: setting.password,
          grant_type: 'password',
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenRes.ok && tokenData.access_token) {
        return res.json({ success: true, message: 'Pathao OAuth Authentication Successful!', token: tokenData.access_token });
      } else {
        return res.status(400).json({ success: false, message: tokenData.message || 'Pathao Authentication Failed' });
      }
    }

    res.status(400).json({ message: 'Unsupported courier provider' });
  } catch (error) {
    res.status(500).json({ message: 'Courier connection test failed', error: error.message });
  }
};

// Create consignment order for courier dispatch
const createCourierConsignment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { provider, deliveryFee, deliveryCost } = req.body; // 'steadfast' or 'pathao'

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (deliveryFee !== undefined || deliveryCost !== undefined) {
      const fee = Number(deliveryFee ?? deliveryCost);
      if (!isNaN(fee) && fee >= 0) {
        order.deliveryFee = fee;
        const sub = order.subtotal || (order.items && order.items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0)) || 0;
        order.subtotal = sub;
        order.total = Math.max(0, sub + fee - (order.discount || 0));
        await order.save();
      }
    }

    const courierProvider = provider || 'steadfast';
    const setting = await CourierSetting.findOne({ provider: courierProvider });

    if (!setting || !setting.isEnabled) {
      return res.status(400).json({ message: `${courierProvider.toUpperCase()} Courier is not enabled in settings` });
    }

    const shipping = order.shippingAddress || {};
    const recipientName = shipping.fullName || order.customerName || order.user?.fullName || 'Customer';
    const recipientPhone = shipping.phone || order.phone || '01700000000';
    const recipientAddress = [shipping.address, shipping.thana, shipping.district, shipping.city].filter(Boolean).join(', ') || order.deliveryAddress || 'Dhaka';
    const isCod = !order.paymentMethod || ['cod', 'cash-on-delivery', 'cash on delivery'].includes(String(order.paymentMethod).toLowerCase());
    const amountToCollect = isCod ? (order.total || order.totalPrice || 0) : 0;

    let consignmentData = null;

    if (courierProvider === 'steadfast') {
      const payload = {
        invoice: order.orderId || order._id.toString(),
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_address: recipientAddress,
        cod_amount: amountToCollect,
        note: `Order #${order.orderId || order._id}`,
      };

      const sfRes = await fetch(`${setting.baseUrl}/create_order`, {
        method: 'POST',
        headers: {
          'Api-Key': setting.apiKey,
          'Secret-Key': setting.secretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const sfData = await sfRes.json();
      if (sfRes.ok && (sfData.status === 200 || sfData.consignment)) {
        consignmentData = {
          consignmentId: sfData.consignment?.consignment_id || sfData.consignment_id || `SF-${Date.now()}`,
          trackingCode: sfData.consignment?.tracking_code || sfData.tracking_code || `SF-TRK-${Date.now()}`,
          provider: 'steadfast',
          status: 'In Review',
        };
      } else {
        return res.status(400).json({ message: sfData.message || 'Failed to create Steadfast consignment', raw: sfData });
      }
    } else if (courierProvider === 'pathao') {
      // Step 1: Issue token
      const tokenRes = await fetch(`${setting.pathaoBaseUrl}/aladdin/api/v1/issue-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: setting.clientId,
          client_secret: setting.clientSecret,
          username: setting.username,
          password: setting.password,
          grant_type: 'password',
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        return res.status(400).json({ message: 'Pathao auth failed: ' + (tokenData.message || '') });
      }

      // Step 2: Create Pathao order
      const pathaoPayload = {
        store_id: setting.storeId,
        merchant_order_id: order.orderId || order._id.toString(),
        sender_name: 'Flash Store',
        sender_phone: '01700000000',
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_address: recipientAddress,
        recipient_city: 1, // Default Dhaka City ID
        recipient_zone: 1,
        delivery_type: 48, // Standard Delivery
        item_type: 2, // Parcel
        special_instruction: `Order #${order.orderId || order._id}`,
        item_quantity: 1,
        item_weight: 0.5,
        amount_to_collect: amountToCollect,
      };

      const pathaoRes = await fetch(`${setting.pathaoBaseUrl}/aladdin/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(pathaoPayload),
      });

      const pathaoData = await pathaoRes.json();
      if (pathaoRes.ok && pathaoData.data) {
        consignmentData = {
          consignmentId: pathaoData.data.consignment_id || `PATHAO-${Date.now()}`,
          trackingCode: pathaoData.data.consignment_id || `PTH-${Date.now()}`,
          provider: 'pathao',
          status: pathaoData.data.order_status || 'Pending',
        };
      } else {
        return res.status(400).json({ message: pathaoData.message || 'Failed to create Pathao consignment', raw: pathaoData });
      }
    }

    // Update order in database with courier status and status = 'Shipped'
    if (consignmentData) {
      order.courier = consignmentData;
      order.status = 'Shipped';
      await order.save();
    }

    res.json({ success: true, message: `Dispatched successfully via ${courierProvider.toUpperCase()}`, consignment: consignmentData, order });
  } catch (error) {
    res.status(500).json({ message: 'Courier consignment creation failed', error: error.message });
  }
};

module.exports = {
  getCourierSettings,
  updateCourierSetting,
  testCourierConnection,
  createCourierConsignment,
};
