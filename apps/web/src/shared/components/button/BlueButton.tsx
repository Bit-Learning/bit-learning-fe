import React from "react";
import styled from "styled-components";

const BlueButton = () => {
	return (
		<StyledWrapper>
			<button className="button">Bắt đầu học ngay</button>
		</StyledWrapper>
	);
};

const StyledWrapper = styled.div`
  .button {
    display: inline-block;
    padding: 12px 28px;
    margin: 10px;
    font-size: 24px;
    font-weight: bold;
    text-transform: uppercase;
    color: #fff;
    background-image: linear-gradient(to bottom right, #00c6ff, #0072ff);
    border: none;
    border-radius: 40px;
    box-shadow: 0px 4px 0px #0072ff;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
  }

  .button:hover {
    transform: translateY(-2px);
    box-shadow: 0px 6px 0px #0072ff;
  }

  .button:active {
    transform: translateY(0px);
    box-shadow: none;
    background-image: linear-gradient(to bottom right, #0072ff, #00c6ff);
  }

  .button:before,
  .button:after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
  }

  .button:before {
    top: -3px;
    left: -3px;
    border-radius: 40px;
    border-top: 3px solid #fff;
    border-left: 3px solid #fff;
  }

  .button:after {
    bottom: -3px;
    right: -3px;
    border-radius: 40px;
    border-bottom: 3px solid #fff;
    border-right: 3px solid #fff;
  }`;

export default BlueButton;
