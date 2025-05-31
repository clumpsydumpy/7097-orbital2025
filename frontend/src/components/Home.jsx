import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center vh-100">
        <h1> Our Products </h1>

        <div className="d-flex flex-wrap p-3" style={{ gap: '16px' }}>          
          <img src="/rose.png" alt="Rose Bouquet" style={{ width: '300px', height: 'auto' }} />
          <img src="/sunflower.png" alt="Sunflower Bouquet" style={{ width: '300px', height: 'auto' }} />
        </div>


        <div style={{ display: "flex"}}> 
          <p className="me-5"> For Admin Use Only:  </p>
        <Link to='/register' className="btn btn-secondary me-2">Register</Link>
        <Link to='/login' className="btn btn-secondary">Login</Link>
        </div>

    </div>
  )
}

export default Home
