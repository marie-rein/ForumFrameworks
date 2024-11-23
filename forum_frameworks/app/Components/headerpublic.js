function Headerpublic() {
    return (
      <nav className="navbar navbar-default navbar-doublerow navbar-trans">

<nav className="navbar navbar-down">
          <div className="container">
            <div className="flex-container">
              <div className="navbar-header flex-item">
                <a className="navbar-brand" href="#">
                  <img src="/images/LogoFWF.png" alt="Logo" height={110} width={110} />
                </a>
              </div>
              <ul className="nav navbar-nav flex-item hidden-xs text-center justify-content-center">
                <li>
                  <a href="#">Home</a>
                </li>
                <li>
                  <a href="#">Forum</a>
                </li>
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <nav className="navbar navbar-top">
          <div className="container">
            <ul className="nav navbar-nav pull-left">
              <li>
                <a href="#">
                  <span className="glyphicon glyphicon-bold text-white"></span>
                </a>
              </li>
              <li>
                <a href="#">
                  <span className="glyphicon glyphicon-globe text-white"></span>
                </a>
              </li>
              <li>
                <a href="#">
                  <span className="glyphicon glyphicon-pushpin text-white"></span>
                </a>
              </li>
            </ul>
            <div className="pull-right navbar-form">
              <input
                type="text"
                className="form-control input-sm"
                name="username"
                placeholder="Username"
                style={{ marginRight: "5px" }}
              />
              <input
                type="password"
                className="form-control input-sm"
                name="password"
                placeholder="Password"
                style={{ marginRight: "5px" }}
              />
              <a href="#" className="btn btn-sm btn-success">
                <span className="glyphicon glyphicon-user"></span> Login
              </a>
              <a href="#" className="btn btn-sm btn-primary" style={{ marginLeft: "5px" }}>
                <span className="glyphicon glyphicon-certificate"></span> Register
              </a>
            </div>
          </div>
        </nav>
  
        
      </nav>
    );
  }
  
  export default Headerpublic;
  