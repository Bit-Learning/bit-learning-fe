import React from "react";
import styled from "styled-components";

const Card = () => {
	return (
		<StyledWrapper>
			<div id="card" className="card">
				<div className="content">
					<div className="card-body">
						<div className="code-container float-animation">
							<span className="line">
								<span className="code-comment">// Co-working space</span>
							</span>
							<span className="line">
								<span className="code-keyword">function</span>{" "}
								<span className="code-function">doPractice</span>()
							</span>
							<span className="line">{"{"}</span>
							<span className="line indent">
								<span className="code-keyword">let</span>{" "}
								<span className="code-variable">message</span> ={" "}
								<span className="code-string">
									"Practice consistent make perfectly!"
								</span>
								;
							</span>
							<span className="line indent">
								<span className="code-built-in">console</span>.
								<span className="code-method">log</span>(
								<span className="code-variable">message</span>);
							</span>
							<span className="line">{"}"}</span>
						</div>
					</div>
				</div>
			</div>
		</StyledWrapper>
	);
};

const StyledWrapper = styled.div`
  .card {
    width: 300px;
    height: 200px;
    // background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .code-container {
    background-color: #222;
    border-radius: 8px;
    padding: 10px;
  }

  .line {
    display: block;
    color: #fff;
    font-size: 14px;
    line-height: 1.5;
    margin: 4px 0;
    position: relative;
  }

  .code-comment {
    color: #5c6370;
  }

  .code-keyword {
    color: #c678dd;
  }

  .code-function {
    color: #61afef;
  }

  .code-variable {
    color: #dcdcaa;
  }

  .code-string {
    color: #98c379;
  }

  .indent {
    padding-left: 20px;
  }

  /* Animación */
  @keyframes float {
    0% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-10px);
    }

    100% {
      transform: translateY(0);
    }
  }

  .float-animation {
    animation: float 2s ease-in-out infinite;
  }`;

export default Card;
