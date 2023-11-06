import whiteLogo from "../images/sparkmate-logo.png";
import colorLogo from "../images/sparkmate-logo.png";


const Nav = ({ authToken, minimal, setShowModal, showModal, setIsSignUp }) => {
  const handleClick = () => {
    setShowModal(true);
    setIsSignUp(false);
  };

  return (
    <nav>
      <div className="logo-container">
        {/* <img
          className="logo"
          src={minimal ? colorLogo : whiteLogo}
          alt="logo"
        /> */
        <h3 className="logo">&#9829; Sparkmate</h3>
        }
      </div>
      {!authToken && !minimal && (
        <button
          className="nav-button"
          onClick={handleClick}
          disabled={showModal}
        >
          Log in
        </button>
      )}
    </nav>
  );
};
export default Nav;