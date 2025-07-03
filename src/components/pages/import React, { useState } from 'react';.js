// const Orders = require('../model/orders');
const { Orders, CustomerProfile, DriversDetails, OrderItems, Products } = require('../model/index.js');
const Notification = require('../model/notification.js');
const sequelize = require('../Config/db.js');

// Create Order
const createOrder = async (req, res) => {
  try {
    const {
      cpid,
      order_date,
      status,
      delivery_date,
      actual_delivery_date,
      delivery_time,
      special_instructions,
      total_amount,
      payment_method,
      invoice_generated,
      address,
      city,
      state,
      postal_code,
      delivery_contact_name,
      delivery_contact_phone,
      order_items // Array of order items
    } = req.body;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // Create the order
      const newOrder = await Orders.create({
        customer_id: cpid,
        order_date,
        status,
        delivery_date,
        actual_delivery_date,
        delivery_time,
        special_instructions,
        total_amount,
        payment_method,
        invoice_generated,
        address,
        city,
        state,
        postal_code,
        delivery_contact_name,
        delivery_contact_phone
      }, { transaction: t });

      // Create order items if provided
      if (order_items && Array.isArray(order_items)) {
        const orderItemsPromises = order_items.map(async (item) => {
          const { product_id, quantity, notes } = item;

          // Fetch product to get unit price
          const product = await Products.findByPk(product_id, { transaction: t });
          if (!product) {
            throw new Error(`Product with ID ${product_id} not found`);
          }

          const unit_price = product.price;
          const line_total = quantity * unit_price;

          return OrderItems.create({
            order_id: newOrder.oid,
            product_id,
            quantity,
            unit_price,
            line_total,
            notes
          }, { transaction: t });
        });

        await Promise.all(orderItemsPromises);
      }

      // Create notification
      await Notification.create({
        order_id: newOrder.oid,
        customer_id: newOrder.customer_id,
        message: `New order created with status: ${status}`
      }, { transaction: t });

      return newOrder;
    });

    // Fetch the complete order with its items
    const completeOrder = await Orders.findByPk(result.oid, {
      include: [
        { model: OrderItems, include: [{ model: Products }] }
      ]
    });

    res.status(201).json({
      message: 'Order created successfully',
      data: {
        ...completeOrder.toJSON(),
        order_id: completeOrder.order_id // Explicitly include order_id in response
      }
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Orders.findAll({
      include: [
        {
          model: DriversDetails,
          attributes: ['did', 'first_name', 'last_name', 'phone', 'vehicle_number'],
          // as: 'Driver'
        },
        {
          model: CustomerProfile,
          attributes: ['cpid', 'contact_person_name', 'contact_person_email', 'institution_name', 'address']
        }
      ]
    });
    res.status(200).json({ data: orders });
  } catch (error) {
    console.error('Get All Orders Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Get Order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Orders.findByPk(id, {
      include: [
        { model: DriversDetails, attributes: ['did', 'first_name', 'last_name', 'phone', 'vehicle_number'] },
        { model: CustomerProfile, attributes: ['cpid', 'contact_person_name', 'contact_person_email', 'institution_name', 'address'] }
      ]
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ data: order });
  } catch (error) {
    console.error('Get Order by ID Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update Order
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cpid,
      driver_id,
      order_date,
      status,
      delivery_date,
      actual_delivery_date,
      delivery_time,
      special_instructions,
      total_amount,
      payment_method,
      invoice_generated,
      address,
      city,
      state,
      postal_code,
      delivery_contact_name,
      delivery_contact_phone
    } = req.body;

    const delivery_image = req.file;

    const order = await Orders.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const originalStatus = order.status;

    if (status === 'Delivered' && !delivery_image && !order.delivery_image) {
      return res.status(400).json({ message: 'Cannot mark as Delivered without delivery image' });
    }

    // Update fields
    order.customer_id = cpid ?? order.customer_id;
    order.driver_id = driver_id ?? order.driver_id;
    order.order_date = order_date ?? order.order_date;
    order.status = status ?? order.status;
    order.delivery_date = delivery_date ?? order.delivery_date;
    order.actual_delivery_date = actual_delivery_date ?? order.actual_delivery_date;
    order.delivery_time = delivery_time ?? order.delivery_time;
    order.special_instructions = special_instructions ?? order.special_instructions;
    order.total_amount = total_amount ?? order.total_amount;
    order.payment_method = payment_method ?? order.payment_method;
    order.invoice_generated = invoice_generated ?? order.invoice_generated;
    order.address = address ?? order.address;
    order.city = city ?? order.city;
    order.state = state ?? order.state;
    order.postal_code = postal_code ?? order.postal_code;
    order.delivery_contact_name = delivery_contact_name ?? order.delivery_contact_name;
    order.delivery_contact_phone = delivery_contact_phone ?? order.delivery_contact_phone;

    if (delivery_image) {
      order.delivery_image = delivery_image.filename;

      if (order.status !== 'Delivered') {
        order.status = 'Delivered';
      }
    }

    await order.save();

    // Notify on status change
    if (order.status !== originalStatus) {
        await Notification.create({
          order_id: order.oid,
          customer_id: order.customer_id,
          message: `Order status updated from ${status} `
        });
    }

    res.status(200).json({
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete Order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Orders.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await order.destroy();

    await Notification.create({
      order_id: order.oid,
      customer_id: order.customer_id,
      message: `Order #${id} has been deleted`
    });

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete Order Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Get Notification
const getNotification = async (req, res) => {
  try {
    const { customer_id } = req.query;

    const whereCondition = customer_id ? { customer_id } : {};

    const notifications = await Notification.findAll({
      where: whereCondition,
      include: [
        {
          model: Orders,
          attributes: ['oid', 'status', 'order_date']
        },
        {
          model: CustomerProfile,
          attributes: ['cpid', 'contact_person_name', 'contact_person_email'] // Adjusted to match actual column names
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Orders by Customer ID
const getOrdersByCustomerId = async (req, res) => {
  try {
    const { customer_id } = req.params;

    // Check if customer exists
    const customer = await CustomerProfile.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const orders = await Orders.findAll({
      where: { customer_id },
      include: [
        {
          model: DriversDetails,
          attributes: ['did', 'first_name', 'last_name']
        },
        {
          model: CustomerProfile,
          attributes: ['cpid', 'contact_person_name', 'contact_person_email', 'institution_name']
        },
        {
          model: OrderItems,
          include: [{ model: Products }]
        }
      ],
      order: [['createdAt', 'DESC']] // Most recent orders first
    });

    if (!orders || orders.length === 0) {
      return res.status(200).json({ 
        message: 'No orders found for this customer',
        data: [] 
      });
    }

    res.status(200).json({ 
      message: 'Orders retrieved successfully',
      data: orders 
    });
  } catch (error) {
    console.error('Get Orders by Customer ID Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getNotification,
  getOrdersByCustomerId
};
