import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, Col, Row, Skeleton, Switch, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Pie, PieConfig } from "@antv/g2plot";
import BigNumber from "bignumber.js";
import orderBy from "lodash/orderBy";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import { rawToRai } from "components/utils";

const { Title } = Typography;

let versionsChart: any = null;

interface Props {
  versions: {
    [key: string]: {
      weight: number;
      count: number;
    };
  };
}

const Representatives: React.FC<Props> = ({ versions }) => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);
  const [isVersionByWeight, setIsVersionByWeight] = React.useState(true);
  const {
    confirmationQuorum: {
      online_weight_quorum_percent: onlineWeightQuorumPercent = 0,
      online_weight_minimum: onlineWeightMinimum = 0,
    },
  } = React.useContext(ConfirmationQuorumContext);

  React.useEffect(() => {
    if (!Object.keys(versions).length) return;

    let data = orderBy(
      Object.entries(versions).map(([version, { weight, count }]) => ({
        version,
        weight,
        count,
      })),
      ["version"],
      ["desc"],
    );

    let totalWeight = 0;
    if (isVersionByWeight) {
      data = data.filter(({ weight }) => {
        totalWeight += weight;
        return !!weight;
      });
    }

    const config: PieConfig = {
      padding: -12,
      data,
      angleField: isVersionByWeight ? "weight" : "count",
      colorField: "version",
      radius: 0.8,
      label: {
        visible: true,
        type: "outer",
        // @ts-ignore
        formatter: (text, item, index) => {
          return `${item._origin.version}`;
        },
        style:
          theme === Theme.DARK
            ? {
                fill: "white",
                stroke: "none",
              }
            : {
                fill: "black",
                stroke: "#fff",
              },
      },
      legend: {
        visible: false,
      },
      tooltip: {
        showTitle: false,
        // @ts-ignore
        formatter: (value, version) => {
          return {
            name: version,
            value: isVersionByWeight
              ? `${new BigNumber(value).toFormat(2)} NANO, ${new BigNumber(
                  value,
                )
                  .times(100)
                  .dividedBy(totalWeight)
                  .toFormat(2)}%`
              : `${value} ${t("common.nodes")}`,
          };
        },
      },
      interactions: [{ type: "element-active" }],
    };

    if (!versionsChart) {
      versionsChart = new Pie(
        document.getElementById("versions-chart") as HTMLElement,
        config,
      );
    } else {
      versionsChart.updateConfig(config);
    }

    versionsChart.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, versions, isVersionByWeight]);

  React.useEffect(() => {
    return () => {
      versionsChart = null;
    };
  }, []);

  return (
    <>
      <Title level={3}>{t("pages.status.nodeVersions")}</Title>

      <Card size="small" bordered={false} className="detail-layout">
        <Row gutter={6}>
          <Col xs={20} md={12}>
            {t("pages.status.versionsByWeight")}
          </Col>
          <Col xs={4} md={12}>
            <Switch
              disabled={!Object.keys(versions).length}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              onChange={(checked: boolean) => {
                setIsVersionByWeight(checked);
              }}
              defaultChecked={isVersionByWeight}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={24}>
            {t("pages.status.versionsByWeightDescription", {
              onlineWeightMinimum: new BigNumber(
                rawToRai(onlineWeightMinimum),
              ).toFormat(),
              onlineWeightQuorumPercent,
            })}
          </Col>
        </Row>
        <Row>
          <Col xs={24}>
            <Skeleton loading={!Object.keys(versions).length} active>
              <div id="versions-chart" />
            </Skeleton>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default Representatives;
