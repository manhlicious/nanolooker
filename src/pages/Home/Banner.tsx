import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, Space, Typography } from "antd";
// import {
//   DollarOutlined,
//   EuroOutlined,
//   PayCircleOutlined,
//   PoundOutlined,
// } from "@ant-design/icons";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import Search from "components/Search";
import { Tracker } from "components/utils/analytics";

const { Title } = Typography;

const Banner: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);

  return (
    <div
      className="home-banner"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        margin: "-12px -12px 12px -12px",
        backgroundColor: theme === Theme.DARK ? "#121212" : "#4bbe4a",
        padding: "40px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "18px",
          flexWrap: "wrap",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <img
          alt="Banano block explorer"
          height="30px"
          src={`/banano.svg`}
          style={{ marginRight: "12px" }}
        />
        <Title
          level={3}
          style={{
            display: "inline-block",
            color: "#fff",
            margin: 0,
            fontWeight: 200,
            fontSize: "28px",
            whiteSpace: "nowrap",
          }}
        >
          {t("common.blockExplorer")}
        </Title>
      </div>

      <div style={{ marginBottom: "18px" }}>
        <Search isHome />
      </div>

      <Space>
        <Link to={"/what-is-banano"}>
          <Button
            ghost
            onClick={() => {
              Tracker.ga4?.gtag("event", "WhatIsBanano");
            }}
          >
            {t("menu.whatIsBanano")}
          </Button>
        </Link>
      </Space>
    </div>
  );
};

export default Banner;
