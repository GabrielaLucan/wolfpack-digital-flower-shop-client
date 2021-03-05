import React, { Component } from 'react';
import axios from 'axios';
import { Form, Col, Table, Row, Image, Container, Button } from 'react-bootstrap';
import dotenv from 'dotenv';
dotenv.config();

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

export default class GetRecommendations extends Component {
    state = {
        occasions: [],
        colors: [],
        colorToAdd: '',
        occasionToAdd: '',
        availableColors: ['aqua', 'beige', 'blue', 'brown', 'coral', 'gray', 'green', 'hotpink', 'ivory', 'olive', 'orange', 'pink', 'purple', 'red', 'salmon', 'violet', 'white', 'yellow'],
        availableOccasions: ['wedding', 'graduation', 'anniversary', 'valentine\'s day', 'proposal', 'funeral'],
        maxRange: 1000,
        minRange: 0,
        recommendations: [],
        errors: {}
    };

    async componentDidMount() {
        const { data } = await axios.get(`${REACT_APP_API_URL}/api/v1/products`);
        this.setState({ availableProducts: data.products });

    }
    removeDesiredColor = (color) => {
        this.setState({ colors: this.state.colors.filter((x) => x !== color) });
    };

    addDesiredColor = () => {
        const { colorToAdd } = this.state;
        if (colorToAdd) {
            const newColors = new Set([...this.state.colors, colorToAdd])
            this.setState({ colors: Array.from(newColors) });
        }
    };
    removeDesiredOccasion = (occasion) => {
        this.setState({ occasions: this.state.occasions.filter((x) => x !== occasion) });
    };

    addDesiredOccasion = () => {
        const { occasionToAdd } = this.state;
        if (occasionToAdd) {
            const newOccasion = new Set([...this.state.occasions, occasionToAdd])
            this.setState({ occasions: Array.from(newOccasion) });
        }
    };

    onChange = (e) => {
        e.preventDefault();
        this.setState({ colors: [...this.state.colors, e.target.value] });
    }

    onFormSubmit = async (event) => {
        event.preventDefault();
        const { occasions, colors, minRange, maxRange } = this.state;
        const params = {
            occasions, colors, priceRange: {
                min: minRange,
                max: maxRange
            }
        };
        console.log('params', params);
        try {
            const { data } = await axios.get(`${REACT_APP_API_URL}/api/v1/recommendations`, params)
            this.setState({ recommendations: data.products });
            console.log('recommendations');
        } catch (e) {
            this.setState({ errors: e });
        }
    }

    render() {
        const { colorToAdd, occasionToAdd } = this.state;
        return (
            <div>
                <Form onSubmit={this.onFormSubmit.bind(this)} role="form">
                    <div style={{ marginTop: '24px' }}>
                        {this.state.colors.length > 0 && <Form.Label>Selected colors</Form.Label>}
                        {this.state.colors.map((color, i) => (
                            <Form.Row style={{ marginTop: '8px' }}>
                                <Col xs={11}>
                                    <Form.Control disabled as="select" name={`color-${i}`} >
                                        <option value="default_color">Choose a color</option>
                                        {this.state.availableColors.map((availableColor) => {
                                            return (
                                                <option selected={color === availableColor} value={availableColor}>
                                                    {availableColor.charAt(0).toUpperCase() + availableColor.slice(1)}
                                                </option>
                                            );
                                        })}
                                    </Form.Control>
                                </Col>
                                <Col xs={1}>
                                    <Button onClick={() => this.removeDesiredColor(color)}>Remove</Button>
                                </Col>
                            </Form.Row>
                        ))}
                        <Form.Label style={{ marginTop: '50px' }}>Which are your favorite colors?</Form.Label>
                        <Form.Row>
                            <Col xs={11}>
                                <Form.Control
                                    as="select"
                                    onChange={({ target }) => {
                                        this.setState({ colorToAdd: target.value });
                                    }}>
                                    <option selected={!colorToAdd} value="default_color"> Choose a color </option>
                                    {this.state.availableColors.map((availableColor) => {
                                        return (
                                            <option selected={availableColor === colorToAdd} value={availableColor}>
                                                {availableColor.charAt(0).toUpperCase() + availableColor.slice(1)}
                                            </option>
                                        );
                                    })}
                                </Form.Control>
                            </Col>
                            <Col xs={1}>
                                <Button style={{ width: '100%' }} onClick={this.addDesiredColor}>Add</Button>
                            </Col>
                        </Form.Row>
                    </div>
                    <hr style={{ marginTop: '30px', backgroundColor: '#E1E4E8', height: '2.5px' }} />
                    <div>
                        {this.state.occasions.length > 0 && <Form.Label>Selected occasions</Form.Label>}
                        {this.state.occasions.map((occasion, i) => (
                            <Form.Row style={{ marginTop: '8px' }}>
                                <Col xs={11}>
                                    <Form.Control disabled as="select" name={`occasion-${i}`} >
                                        <option value="default_occasion">Choose an occasion</option>
                                        {this.state.availableOccasions.map((availableOccasion) => {
                                            return (
                                                <option selected={occasion === availableOccasion} value={availableOccasion}>
                                                    {availableOccasion.charAt(0).toUpperCase() + availableOccasion.slice(1)}
                                                </option>
                                            );
                                        })}
                                    </Form.Control>
                                </Col>
                                <Col xs={1}>
                                    <Button onClick={() => this.removeDesiredOccasion(occasion)}>Remove</Button>
                                </Col>
                            </Form.Row>
                        ))}
                        <Form.Label style={{ marginTop: '40px' }} >What's the occasion?</Form.Label>
                        <Form.Row>
                            <Col xs={11}>
                                <Form.Control
                                    as="select"
                                    onChange={({ target }) => {
                                        this.setState({ occasionToAdd: target.value });
                                    }}>
                                    <option selected={!occasionToAdd} value="default_occasion"> Choose an occasion </option>
                                    {this.state.availableOccasions.map((availableOccasion) => {
                                        return (
                                            <option selected={availableOccasion === occasionToAdd} value={availableOccasion}>
                                                {availableOccasion.charAt(0).toUpperCase() + availableOccasion.slice(1)}
                                            </option>
                                        );
                                    })}
                                </Form.Control>
                            </Col>
                            <Col xs={1}>
                                <Button style={{ width: '100%' }} onClick={this.addDesiredOccasion}>Add</Button>
                            </Col>
                        </Form.Row>
                        <Form.Label style={{ marginTop: '50px' }}>Select a price range (RON)</Form.Label>
                        <Form.Row>
                            <Col xs={6}>
                                <Form.Control name='minRange' type="number" placeholder="0"
                                    onChange={(e) => {
                                        this.setState({ minRange: e.target.value });
                                    }} />
                            </Col>
                            <Col xs={6}>
                                <Form.Control name='maxRange' type="number" placeholder="1000"
                                    onChange={(e) => {
                                        this.setState({ maxRange: e.target.value });
                                    }} />
                            </Col>
                        </Form.Row>

                        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                            <Button variant="success" type="submit" style={{ marginRight: '8px' }}>See recommended flowers</Button>
                            <Button variant="primary" type="button" onClick={() => this.props.history.goBack()} >  Cancel </Button>
                        </div>
                    </div>
                </Form >
                <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                    {this.state.recommendations.length > 0 &&
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>Name</th>
                                    <th style={{ textAlign: 'center' }}>Price</th>
                                    <th style={{ textAlign: 'center' }}>Pictures</th>
                                    <th style={{ textAlign: 'center' }}>Colors</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.recommendations.map((flower) => {
                                    return <tr>
                                        <td>{flower.description}</td>
                                        <td>{flower.price}</td>
                                        <td><Container>
                                            <Row>
                                                {flower.pictures.map((pictureUrl) => {
                                                    return (
                                                        <Col>
                                                            <Image style={{ border: '8px solid #ddd', borderRadius: '13px', padding: '5px', width: '74px', borderStyle: 'none' }}
                                                                src={pictureUrl}
                                                            />
                                                        </Col>
                                                    )
                                                })}
                                            </Row>
                                        </Container> </td>
                                        <td>{flower.colors.join(', ')}</td>
                                    </tr>
                                })
                                }
                            </tbody>
                        </Table>
                    }
                </div>
            </div>
        );
    }
}
