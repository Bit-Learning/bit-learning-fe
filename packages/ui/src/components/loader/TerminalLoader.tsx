import styled from "styled-components";

const Loader = () => {
	return (
		<StyledWrapper>
			<div className="loader">
				<div className="bar1" />
				<div className="bar2" />
				<div className="bar3" />
				<div className="bar4" />
				<div className="bar5" />
				<div className="bar6" />
				<div className="bar7" />
				<div className="bar8" />
				<div className="bar9" />
				<div className="bar10" />
				<div className="bar11" />
				<div className="bar12" />
			</div>
		</StyledWrapper>
	);
};

const StyledWrapper = styled.div`
  position: fixed;
  inset: 0; /* top:0 right:0 bottom:0 left:0 */

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 9999; /* luôn nằm trên cùng */
  background: rgba(255, 255, 255, 0.6); /* optional: overlay mờ */

  .loader {
    position: relative;
    width: 54px;
    height: 54px;
    border-radius: 10px;
  }

  .loader div {
    width: 8%;
    height: 24%;
    background: rgb(128, 128, 128);
    position: absolute;
    left: 50%;
    top: 30%;
    opacity: 0;
    border-radius: 50px;
    box-shadow: 0 0 3px rgba(0,0,0,0.2);
    animation: fade458 1s linear infinite;
  }

  @keyframes fade458 {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.25;
    }
  }

  /* giữ nguyên phần bar */
`;

export default Loader;
