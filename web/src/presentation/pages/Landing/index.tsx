import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import logoImg from "../../assets/images/logo.png";
import landingImg from "../../assets/images/landing.svg";

import studyIcon from "../../assets/images/icons/study.svg";
import giveClassesIcon from "../../assets/images/icons/give-classes.svg";
import purpleHeartIcon from "../../assets/images/icons/purple-heart.svg";

import api from "../../../services/api";

import "./styles.css";

function Landing() {
  const [totalConnections, setTotalConnections] = useState(0);

  useEffect(() => {
    api.get("connections").then((response) => {
      const { total } = response.data;

      setTotalConnections(total);
    });
  }, []);

  return (
    <div>
      <div id="page-landing">
        <div id="page-landing-content" className="container">
          <div className="logo-container">
            <img src={logoImg} alt="Proffy" />
            <h2>
              Feel free to talk to people about your favorite subjects while
              learning English.
            </h2>
          </div>

          <img
            src={landingImg}
            alt="Plataforma de estudos"
            className="hero-image"
          />

          <div className="buttons-container">
            <Link to="/study" className="give-classes">
              Start
            </Link>
          </div>

          <span className="total-connections">
            Total {totalConnections} connections already made{" "}
            <img src={purpleHeartIcon} alt="Coração roxo" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default Landing;
