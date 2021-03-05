import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { EditOrder, ListOrders, GetRecommendations } from './components/index';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import dotenv from 'dotenv';
dotenv.config();

export default function App() {
  return (
    <Router>
      <div>
        <h2 style={{ marginLeft: '35%', marginTop: '32px', marginBottom: '32px' }}>🐺 Wolfpack Digital Flower Shop 🌸</h2>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px -16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link to={'/list'} className="nav-link">
                <Button>List Orders</Button>
              </Link>
              <Link to={'/edit'} className="nav-link" style={{ paddingLeft: '8px' }}>
                <Button> Add Order</Button>
              </Link>
            </div>
            <Link to={'/recommendations'} className="nav-link">
              <Button style={{ backgroundColor: '#f06292', borderColor: '#ad1457' }}>Get 🌸 Recommendations</Button>
            </Link>
          </div>
          <Switch>
            <Route exact path="/" component={ListOrders} />
            <Route exact path="/list" component={ListOrders} />
            <Route path="/edit" component={EditOrder} />
            <Route path="/recommendations" component={GetRecommendations} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}
