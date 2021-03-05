import React, { Component } from 'react'
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import axios from 'axios'
import moment from 'moment'
import dotenv from 'dotenv'
dotenv.config()

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

export class ListOrders extends Component {
    constructor(props) {
        super(props);
        this.editOrder = this.editOrder.bind(this);
        this.state = {
            orders: []
        }
    }
    async componentDidMount() {
        const { data } = await axios.get(`${REACT_APP_API_URL}/api/v1/orders`);
        this.setState({
            orders: data.orders
        });
    }

    editOrder(order) {
        // this.props.history.push(`/edit/${orderId}`)
        this.props.history.push({
            pathname: '/edit',
            state: {
                order
            }
        })
    }
    render() {
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Phone number</th>
                        <th>Shipping type</th>
                        <th>Shipping address</th>
                        <th>Shipping date</th>
                        <th>Packaging</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>#</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.orders.map((order, index) => {
                        return <tr>
                            <td>{index}</td>
                            <td>{order.shippingOptions.name}</td>
                            <td>{order.shippingOptions.phoneNumber}</td>
                            <td>{order.shippingOptions.type}</td>
                            <td>{order.shippingOptions.address || '-'}</td>
                            <td>{moment(order.shippingOptions.date).format('MMMM Do YYYY, h:mm:ss a')}</td>
                            <td>{order.packagingType}</td>
                            <td>{moment(order.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</td>
                            <td>{moment(order.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}</td>
                            <td>{order.status}</td>
                            <td>{order.totalPrice.toFixed(2)}</td>
                            <td>
                                <Button onClick={() => this.editOrder(order)}>Edit</Button>
                            </td>
                        </tr>
                    })
                    }
                </tbody>
            </Table>
        )
    }
}

export default ListOrders  