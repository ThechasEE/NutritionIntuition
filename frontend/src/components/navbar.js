import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav className="navbar">
            <h1>Navigation</h1>
            <div className="links">
                <Link to="/">Login Page (TEMP) </Link>
                <Link to="/create" style={{
                    color: "white",
                    backgroundColor: '#9416ff',
                    borderRadius: '8px'
                    //change to "Link to" instead of "a href" when you don't
                    //want to talk to the server
                }}>Add new Recipe</Link>
            </div>
        </nav>
    );
}

export default Navbar;