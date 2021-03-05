import React, { Component } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import validator from 'validator';
import moment from 'moment';

import dotenv from 'dotenv';
dotenv.config();

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

export default class EditOrder extends Component {
    state = {
        name: '',
        type: 'pickup',
        address: '',
        packagingType: 'bouquet',
        phone: '',
        date: '',
        desiredProducts: [],
        availableProducts: [],
        status: '',
        errors: {},
        success: false,
        orderId: null,
        productToAdd: {
            productId: '',
            quantity: 1,
        },
    };

    async componentDidMount() {
        const { data } = await axios.get(`${REACT_APP_API_URL}/api/v1/products`);
        this.setState({ availableProducts: data.products });

        const { order } = this.props.history?.location?.state || {};

        if (order) {
            const orderToEdit = {
                name: order.shippingOptions.name,
                phone: order.shippingOptions.phoneNumber,
                type: order.shippingOptions.type,
                packagingType: order.packagingType,
                date: moment(order.shippingOptions.date).format('yyyy-MM-DD'),
                address: order.shippingOptions.address,
                status: order.status,
                desiredProducts: order.items,
                orderId: order._id,
            };
            this.setState({ ...orderToEdit });
        }
    }

    onFormSubmit = async (event) => {
        event.preventDefault();
        let formIsValid = this.handleValidation();
        if (formIsValid) {
            const { order } = this.props.history?.location?.state || {};
            console.log('this.state.status', order);

            const reqBody = {
                shippingOptions: {
                    name: this.state.name,
                    phoneNumber: this.state.phone,
                    date: new Date(this.state.date),
                    address: this.state.address || undefined,
                    type: this.state.type || undefined,
                },
                packagingType: this.state.packagingType || undefined,
                status: this.state.status || undefined,
                items: this.state.desiredProducts,
            };

            try {
                order
                    ? await axios.put(`${REACT_APP_API_URL}/api/v1/orders/${order._id}`, reqBody)
                    : await axios.post(`${REACT_APP_API_URL}/api/v1/orders`, reqBody)
                this.props.history.goBack();
            } catch (e) {
                this.setState({ errors: e });
            }
        }
    };

    handleValidation() {
        const { availableProducts, desiredProducts } = this.state;
        let errors = {};
        let formIsValid = true;

        // Check if selected any products
        if (!desiredProducts?.length) {
            formIsValid = false;
            errors['desiredProducts'] = `Order cannot be empty. Please choose at least one item`;
        }

        // Check for quantity 0
        if (desiredProducts.some((item) => item.quantity === 0)) {
            formIsValid = false;
            errors['quantity'] = `Quantity cannot be 0`;
        }

        // Check for empty product
        if (desiredProducts.some((item) => !item.productId)) {
            formIsValid = false;
            errors['desiredProducts'] = `Order cannot be empty. Please choose at least one item`;
        }

        // DesiredProducts availability
        const unavailableProducts = [];
        desiredProducts.forEach((item) => {
            const product = availableProducts.find((product) => product._id.toString() === item.productId);
            if (!product || product.quantity < item.quantity) {
                unavailableProducts.push(product?.description || '');
            }
        });

        if (unavailableProducts.length) {
            formIsValid = false;
            errors['quantity'] = `😔 Order cannot be fulfilled. The following products are unavailable in the selected quantity: ${unavailableProducts.join(', ')}`;
        }

        // Check date input
        if (!validator.isDate(this.state.date)) {
            formIsValid = false;
            errors['date'] = `Date is not valid`;
        }

        // Check phone number
        if (this.state.phone.length !== 10) {
            formIsValid = false;
            errors['phone'] = `Phone doesn't have 10 digits`;
        }

        // Check address if delivery
        if (this.state.type === 'delivery' && !this.state.address) {
            formIsValid = false;
            errors['address'] = `If delivery option is selected, address must be given`;
        }
        this.setState({ errors: errors });
        return formIsValid;
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    removeDesiredProduct = (productId) => {
        this.setState({ desiredProducts: this.state.desiredProducts.filter((x) => x.productId !== productId) });
    };

    addDesiredProduct = () => {
        const { productToAdd } = this.state;

        if (!productToAdd.productId || !productToAdd.quantity) {
            this.setState({ errors: { ...this.state.errors, newProduct: true } });
        } else {
            this.setState({ desiredProducts: [...this.state.desiredProducts, productToAdd], errors: { ...this.state.errors, newProduct: false } });
        }
    };

    render() {
        const { productToAdd } = this.state;

        return (
            <Form onSubmit={this.onFormSubmit.bind(this)} role="form">
                <Form.Row>
                    <Col>
                        <Form.Label>Name</Form.Label>
                        <Form.Control name="name" type="text" required={true} placeholder="Enter your name" value={this.state.name} onChange={this.handleChange} />
                    </Col>
                    <Col>
                        <Form.Label>Phone number</Form.Label>
                        <Form.Control name="phone" type="phone" required={true} placeholder="Phone number" value={this.state.phone} onChange={this.handleChange} />
                        <Form.Text className="text-muted">10 digits number</Form.Text>
                        <Form.Text style={{ color: 'red' }}>{this.state.errors['phone']}</Form.Text>
                    </Col>
                </Form.Row>
                <Form.Row>
                    <Col>
                        <Form.Label>Select shipping type</Form.Label>
                        <Form.Control
                            as="select"
                            name="type"
                            value={this.state.type}
                            onChange={(e) => {
                                this.setState({ type: e.target.value, address: '' });
                            }}
                        >
                            <option value="pickup">Pickup</option>
                            <option value="delivery">Delivery</option>
                        </Form.Control>
                    </Col>
                    <Col>
                        <Form.Label>Select packaging type</Form.Label>
                        <Form.Control as="select" name="packagingType" value={this.state.packagingType} onChange={this.handleChange}>
                            <option value="bouquet">Bouquet</option>
                            <option value="raw">Raw</option>
                            <option value="box">Box</option>
                            <option value="potted">Potted</option>
                            <option value="wreath">Wreath</option>
                        </Form.Control>
                    </Col>
                </Form.Row>
                {this.state.type === 'delivery' && (
                    <Form.Group controlId="Address" style={{ marginTop: '24px' }}>
                        <Form.Label>Name</Form.Label>
                        <Form.Control name="address" type="text" placeholder="Enter your delivery address" value={this.state.address} onChange={this.handleChange} />
                        <Form.Text style={{ color: 'red' }}>{this.state.errors['address']}</Form.Text>
                    </Form.Group>
                )}
                <Form.Row controlId="Date" style={{ marginTop: '24px' }}>
                    <Col>
                        <Form.Label>Delivery or pickup date</Form.Label>
                        <Form.Control name="date" type="date" required={true} placeholder="2021-04-08" value={moment(this.state.date, 'yyyy-MM-DD').format('yyyy-MM-DD')} onChange={this.handleChange} />
                        <Form.Text style={{ color: 'red' }}>{this.state.errors['date']}</Form.Text>
                    </Col>

                    {this.state.orderId && (
                        <Col>
                            <Form.Label>Order status</Form.Label>
                            <Form.Control as="select" name="status" value={this.state.status} onChange={this.handleChange}>
                                <option value="created">Created</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="processing">Processing</option>
                                <option value="cancelled">Cancelled</option>
                            </Form.Control>
                        </Col>
                    )}
                </Form.Row>
                <div style={{ marginTop: '24px' }}>
                    {this.state.desiredProducts.length > 0 && <Form.Label>Selected flowers</Form.Label>}
                    {this.state.desiredProducts.map(({ productId, quantity }, i) => (
                        <Form.Row style={{ marginTop: '8px' }}>
                            <Col xs={6}>
                                <Form.Control as="select" name={`productId-${i}`} disabled>
                                    <option value="default_product">Choose a product</option>
                                    {this.state.availableProducts.map((product) => {
                                        return (
                                            <option selected={product._id === productId} value={product._id}>
                                                {product.description}
                                            </option>
                                        );
                                    })}
                                </Form.Control>
                            </Col>
                            <Col xs={5}>
                                <Form.Control disabled name={`quantity-${i}`} value={quantity} type="number" placeholder="quantity" />
                            </Col>
                            <Col xs={1}>
                                <Button onClick={() => this.removeDesiredProduct(productId)}>Remove</Button>
                            </Col>
                        </Form.Row>
                    ))}

                    <Form.Label style={{ marginTop: '50px' }}>Add new 🌹</Form.Label>

                    <Form.Row>
                        <Col xs={6}>
                            <Form.Control
                                as="select"
                                onChange={({ target }) => {
                                    this.setState({ productToAdd: { ...this.state.productToAdd, productId: target.value } });
                                }}
                            >
                                <option selected={!productToAdd.productId} value="default_product">
                                    Choose a product
                </option>
                                {this.state.availableProducts.map((product) => {
                                    return (
                                        <option selected={product._id === productToAdd.productId} value={product._id}>
                                            {product.description}
                                        </option>
                                    );
                                })}
                            </Form.Control>
                        </Col>
                        <Col xs={5}>
                            <Form.Control
                                required={true}
                                value={productToAdd.quantity}
                                type="number"
                                placeholder="quantity"
                                onChange={({ target }) => {
                                    this.setState({ productToAdd: { ...this.state.productToAdd, quantity: target.value } });
                                }}
                            />
                        </Col>
                        <Col xs={1}>
                            <Button style={{ width: '100%' }} onClick={this.addDesiredProduct}>
                                Add
              </Button>
                        </Col>
                    </Form.Row>
                    {this.state.errors['desiredProducts'] && <Form.Text style={{ color: 'red' }}>{this.state.errors['desiredProducts']}</Form.Text>}
                    {this.state.errors['quantity'] && <Form.Text style={{ color: 'red' }}>{!this.state.errors['desiredProducts'] ? this.state.errors['quantity'] : false}</Form.Text>}
                    {this.state.errors['newProduct'] && <Form.Label style={{ color: 'red', marginBottom: '24px' }}>You must complete the previous product name and quantity.</Form.Label>}
                </div>

                <div style={{ marginTop: '24px' }}>
                    <Button variant="primary" type="button" onClick={() => this.props.history.goBack()} style={{ marginRight: '8px' }}>
                        Cancel
          </Button>
                    <Button variant="success" type="submit">
                        {this.state.orderId ? 'Save' : 'Submit order'}
                    </Button>
                </div>
                {this.state.success && <Form.Label>Order has been successfully created</Form.Label>}
                <Form.Text style={{ color: 'red' }}>{this.state.errors['onSave']}</Form.Text>
            </Form>
        );
    }
}
