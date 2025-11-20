import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

const NavBar = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-lg sticky-top">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    🏡 RE Investment Analyzer
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {/* NavLinks use the 'as={Link}' prop to integrate React Router */}
                        <Nav.Link as={Link} to="/">Analyzer</Nav.Link>
                        <Nav.Link as={Link} to="/metrics">Metrics Explained</Nav.Link>
                        <Nav.Link as={Link} to="/saved">Saved Deals</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;