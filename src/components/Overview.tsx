import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Panel, Loader } from "rsuite";
import styled from "styled-components";
import { getRandomColor } from "../services/ColorService";
import { reciveAll, reciveYears } from "../services/DatabaseService";
import { calc } from "../services/Moneyservice";
import BookeeEntry from "../types/BookeeEntry";

function Overview() {
  const [loading, isLaoding] = useState<boolean>(true);
  const [entities, setEntities] = useState<BookeeEntry[]>([]);
  const [years, setYears] = useState<number[]>([]);

  const [overallExpenditure, setOverallExpenditure] = useState<any[]>([]);
  const [overallDiff, setOverallDiff] = useState<any[]>([]);

  const loadData = () => {
    console.log("Pull entries");
    reciveAll("entries", (results: any[]) => {
      setEntities(results);
    });
    reciveYears((results: any[]) => {
      setYears(results);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let overall: any[] = [];

    years.forEach((year: number) => {
      let mon: any[] = [];
      let dif: any[] = [];
      for (let i = 0; i < 12; i++) {
        let pOneSum = 0;
        let pTwoSum = 0;
        entities
          .filter(
            (entry) => entry.dateYear === year && entry.dateMonth === i + 1
          )
          .forEach((entry) => {
            const { one, two } = calc(entry);
            pOneSum += one;
            pTwoSum += two;
          });
        mon.push({ pOneSum, pTwoSum });
        const low = (pTwoSum - pOneSum) / 2;
        const high = (pOneSum - pTwoSum) / 2;
        dif.push({ low, high });
      }
      overall.push({ year: year, mon: mon, dif: dif });
    });

    const over = [];
    const dif = [];
    for (let i = 0; i < 12; i++) {
      let lineExp = { name: i + 1 };
      let lineDif = { name: i + 1 };
      years.forEach((year, index) => {
        lineExp = {
          ...lineExp,
          [year]:
            (overall[index].mon[i].pOneSum + overall[index].dif[i].low) / 100,
        };
        lineDif = {
          ...lineDif,
          [year]: overall[index].dif[i].low / 100,
        };
      });
      over.push(lineExp);
      dif.push(lineDif);
    }

    setOverallDiff(dif);
    setOverallExpenditure(over);
    isLaoding(false);
  }, [years, entities]);

  return (
    <>
      {loading && <Loader backdrop content="loading..." vertical />}
      {!loading && years && entities && (
        <PanelWrapper>
          <Panel header="Monthly Expenditure" defaultExpanded shaded>
            {overallExpenditure.length > 0 && (
              <LineChart
                width={730}
                height={250}
                data={overallExpenditure}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                {years.map((year, index) => {
                  return (
                    <Line
                      key={index}
                      type="monotone"
                      dataKey={year}
                      stroke={getRandomColor()}
                    />
                  );
                })}
                <Tooltip />
                <Legend />
              </LineChart>
            )}
          </Panel>
          <Panel header="Monthly Difference" defaultExpanded shaded>
            {overallExpenditure.length > 0 && (
              <LineChart
                width={730}
                height={250}
                data={overallDiff}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                {years.map((year, index) => {
                  return (
                    <Line
                      key={index}
                      type="monotone"
                      dataKey={year}
                      stroke={getRandomColor()}
                    />
                  );
                })}
                <Tooltip />
                <Legend />
              </LineChart>
            )}
          </Panel>
        </PanelWrapper>
      )}
    </>
  );
}

export default Overview;

const PanelWrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;
