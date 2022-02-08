import { useEffect, useState } from "react";
import {
  FlexboxGrid,
  Col,
  Panel,
  InputNumber,
  InputPicker,
  Button,
  Modal,
  DatePicker,
  Loader,
  IconButton,
} from "rsuite";
import PlusIcon from "@rsuite/icons/Plus";
import { Table, Column, HeaderCell, Cell } from "rsuite-table";
import styled from "styled-components";
import {
  reciveAll,
  reciveYears,
  remove,
  saveNew,
  update,
} from "../services/DatabaseService";
import { calc } from "../services/Moneyservice";
import BookeeEntry from "../types/BookeeEntry";

interface $Props {
  title: string;
  summary: number;
}

const HeaderSummary = ({ title, summary }: $Props) => (
  <div>
    <label>{title}</label>
    <div
      style={{
        fontSize: 18,
        color: "#2eabdf",
      }}
    >
      {summary / 100}€
    </div>
  </div>
);

function Dashboard() {
  const [loading, isLaoding] = useState<boolean>(true);
  const [entities, setEntities] = useState<BookeeEntry[]>([]);
  const [yearlyEntities, setYearlyEntities] = useState<BookeeEntry[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState<number>();
  const [monthlySum, setMonthlySum] = useState<BookeeEntry[]>([]);
  const [monthlyDiff, setMonthlyDif] = useState<BookeeEntry[]>([]);
  const [thisMonthDif, setThisMonthDif] = useState<BookeeEntry[]>([]);

  const [yearlySum, setYearlySum] = useState<{ one: number; two: number }>({
    one: 0,
    two: 0,
  });
  const [yearlySumDiff, setYearlySumDiff] = useState<{
    one: number;
    two: number;
  }>({ one: 0, two: 0 });

  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState<BookeeEntry>(new BookeeEntry());

  const loadData = () => {
    console.log("Pull entries");
    reciveAll((results: any[]) => {
      setEntities(results);
    });
    reciveYears((results: any[]) => {
      setYears(results);
      setYear(results[0]);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log("New year");
    const x = entities.filter((entry) => entry.dateYear === year);

    const today = new Date();
    let pOneThisMonthSum = 0;
    let pTwoThisMonthSum = 0;
    let pOneYearSum = 0;
    let pTwoYearSum = 0;
    let pOneYearSumDiff = 0;
    let pTwoYearSumDiff = 0;

    let mon: BookeeEntry[] = [];
    let dif: BookeeEntry[] = [];
    for (let i = 0; i < 12; i++) {
      let pOneSum = 0;
      let pTwoSum = 0;
      x.filter((entry) => entry.dateMonth === i + 1).forEach((entry) => {
        const { one, two } = calc(entry);
        pOneSum += one;
        pTwoSum += two;
        pOneYearSum += one;
        pTwoYearSum += two;
        if (
          today.getMonth() + 1 === entry.dateMonth &&
          today.getFullYear() === entry.dateYear
        ) {
          pOneThisMonthSum += one;
          pTwoThisMonthSum += two;
        }
      });
      mon.push(new BookeeEntry(0, pOneSum, pTwoSum, 0, i + 1));
      const low = (pTwoSum - pOneSum) / 2;
      const high = (pOneSum - pTwoSum) / 2;
      dif.push(new BookeeEntry(0, low, high, 0, i + 1));
      pOneYearSumDiff += low;
      pTwoYearSumDiff += high;
    }
    setThisMonthDif([
      new BookeeEntry(
        0,
        pOneThisMonthSum,
        pTwoThisMonthSum,
        0,
        today.getMonth() + 1,
        today.getFullYear()
      ),
    ]);
    setMonthlySum(mon);
    setMonthlyDif(dif);
    setYearlyEntities(x);
    setYearlySum({ one: pOneYearSum, two: pTwoYearSum });
    setYearlySumDiff({ one: pOneYearSumDiff, two: pTwoYearSumDiff });
    isLaoding(false);
  }, [year, entities]);

  const handleOpen = (entry: BookeeEntry) => {
    console.log(entry);
    setEntry(entry);
    setOpen(true);
  };
  const handleNewOpen = () => {
    const today = new Date();
    handleOpen(
      new BookeeEntry(
        0,
        0,
        0,
        today.getDate(),
        today.getMonth() + 1,
        today.getFullYear()
      )
    );
  };
  const handleSave = () => {
    if (entry !== undefined) {
      isLaoding(true);
      update(entry);
      setOpen(false);
      loadData();
    }
  };
  const handleNewSave = () => {
    if (entry !== undefined) {
      isLaoding(true);
      saveNew(entry);
      setOpen(false);
      loadData();
    }
  };
  const handleDelete = () => {
    if (entry !== undefined) {
      isLaoding(true);
      remove(entry.id);
      setOpen(false);
      loadData();
    }
  };
  const handleClose = () => setOpen(false);

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Modal.Header>
          <Modal.Title>
            Edit {entry?.id === 0 ? "new Entry" : "Entry " + entry?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {entry !== undefined && (
            <FlexboxGrid justify="space-around">
              <FlexboxGrid.Item as={Col} colspan={24} md={12}>
                {localStorage.getItem("pOne")}:{" "}
                <InputNumber
                  defaultValue={entry?.pOne / 100}
                  step={0.01}
                  postfix="€"
                  onChange={(num) =>
                    setEntry((e) => ({
                      ...e,
                      pOne: parseFloat("" + num) * 100,
                    }))
                  }
                  style={{ width: 200 }}
                />
                {localStorage.getItem("pTwo")}:{" "}
                <InputNumber
                  defaultValue={entry?.pTwo / 100}
                  step={0.01}
                  postfix="€"
                  onChange={(num) =>
                    setEntry((e) => ({
                      ...e,
                      pTwo: parseFloat("" + num) * 100,
                    }))
                  }
                  style={{ width: 200 }}
                />
                Date:
                <br />
                <DatePicker
                  value={
                    new Date(
                      entry?.dateYear,
                      entry?.dateMonth - 1,
                      entry?.dateDay
                    )
                  }
                  onChange={(date) => {
                    if (date !== null) {
                      setEntry((e) => ({
                        ...e,
                        dateDay: date.getDate(),
                        dateMonth: date.getMonth() + 1,
                        dateYear: date.getFullYear(),
                      }));
                    }
                  }}
                  format="dd.MM.yyyy"
                  style={{ width: 200 }}
                />
              </FlexboxGrid.Item>
              <FlexboxGrid.Item as={Col} colspan={24} md={12}>
                {entry.mods.map((mod) => {
                  return (
                    <>
                      {localStorage.getItem("pOne")}:{" "}
                      <InputNumber
                        defaultValue={mod.pOneMod ? mod.pOneMod / 100 : 0}
                        step={0.01}
                        postfix="€"
                        style={{ width: 120 }}
                      />
                      {localStorage.getItem("pTwo")}:{" "}
                      <InputNumber
                        defaultValue={mod.pTwoMod ? mod?.pTwoMod / 100 : 0}
                        step={0.01}
                        postfix="€"
                        style={{ width: 120 }}
                      />
                    </>
                  );
                })}
              </FlexboxGrid.Item>
            </FlexboxGrid>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={entry?.id === 0 ? handleNewSave : handleSave}
            appearance="primary"
          >
            Save
          </Button>
          {entry?.id !== 0 && (
            <Button onClick={handleDelete} appearance="primary" color="red">
              Delete
            </Button>
          )}
          <Button onClick={handleClose} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      <ButtonWrapper>
        <IconButton
          onClick={(e) => handleNewOpen()}
          icon={<PlusIcon />}
          color="blue"
          appearance="primary"
          circle
          size="lg"
        />
      </ButtonWrapper>
      {loading && <Loader backdrop content="loading..." vertical />}
      {!loading && year && years && entities && yearlyEntities && (
        <PanelWrapper>
          <Panel header="This Month Difference" defaultExpanded shaded>
            <Table
              virtualized
              height={100}
              data={thisMonthDif}
              onRowClick={(data) => {
                handleOpen(data as BookeeEntry);
              }}
            >
              <Column width={150}>
                <HeaderCell>{"" + localStorage.getItem("pOne")}</HeaderCell>
                <Cell>
                  {(rowData) => {
                    const { one } = calc(rowData as BookeeEntry);
                    return (
                      <span>
                        {one !== 0 ? `${one / 100}€` : "-"}{" "}
                        {one !== rowData.pOne ? `(${rowData.pOne / 100})` : ""}
                      </span>
                    );
                  }}
                </Cell>
              </Column>
              <Column width={150}>
                <HeaderCell>{"" + localStorage.getItem("pTwo")}</HeaderCell>
                <Cell>
                  {(rowData) => {
                    const { two } = calc(rowData as BookeeEntry);
                    return (
                      <span>
                        {two !== 0 ? `${two / 100}€` : "-"}{" "}
                        {two !== rowData.pTwo ? `(${rowData.pTwo / 100})` : ""}
                      </span>
                    );
                  }}
                </Cell>
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Date</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <span>
                      {rowData.dateMonth > 9
                        ? rowData.dateMonth
                        : "0" + rowData.dateMonth}
                      .{rowData.dateYear}
                    </span>
                  )}
                </Cell>
              </Column>
            </Table>
          </Panel>
          <Panel defaultExpanded shaded>
            <InputPicker
              data={years.map((year) => {
                return { label: "" + year, value: year };
              })}
              value={year}
              onChange={setYear}
              style={{ width: 224 }}
            />
            <Table
              virtualized
              height={400}
              headerHeight={65}
              data={yearlyEntities}
              onRowClick={(data) => {
                handleOpen(data as BookeeEntry);
              }}
            >
              <Column flexGrow={1} align="center" fixed>
                <HeaderCell>Id</HeaderCell>
                <Cell dataKey="id" />
              </Column>
              <Column width={150}>
                <HeaderCell>
                  <HeaderSummary
                    title={"" + localStorage.getItem("pOne")}
                    summary={yearlySum.one}
                  />
                </HeaderCell>
                <Cell>
                  {(rowData) => {
                    const { one } = calc(rowData as BookeeEntry);
                    return (
                      <span>
                        {one !== 0 ? `${one / 100}€` : "-"}{" "}
                        {one !== rowData.pOne ? `(${rowData.pOne / 100})` : ""}
                      </span>
                    );
                  }}
                </Cell>
              </Column>
              <Column width={150}>
                <HeaderCell>
                  <HeaderSummary
                    title={"" + localStorage.getItem("pTwo")}
                    summary={yearlySum.two}
                  />
                </HeaderCell>
                <Cell>
                  {(rowData) => {
                    const { two } = calc(rowData as BookeeEntry);
                    return (
                      <span>
                        {two !== 0 ? `${two / 100}€` : "-"}{" "}
                        {two !== rowData.pTwo ? `(${rowData.pTwo / 100})` : ""}
                      </span>
                    );
                  }}
                </Cell>
              </Column>
              <Column flexGrow={1}>
                <HeaderCell>Date</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <span>
                      {rowData.dateDay > 9
                        ? rowData.dateDay
                        : "0" + rowData.dateDay}
                      .
                      {rowData.dateMonth > 9
                        ? rowData.dateMonth
                        : "0" + rowData.dateMonth}
                      .{rowData.dateYear}
                    </span>
                  )}
                </Cell>
              </Column>
            </Table>
          </Panel>
          <Panel header="Monthly Summary" shaded>
            <Table
              virtualized
              height={400}
              headerHeight={65}
              data={monthlySum}
              onRowClick={(data) => {
                console.log(data);
              }}
            >
              <Column flexGrow={1}>
                <HeaderCell>Month</HeaderCell>
                <Cell dataKey="dateMonth" />
              </Column>
              <Column width={150}>
                <HeaderCell>
                  <HeaderSummary
                    title={"" + localStorage.getItem("pOne")}
                    summary={yearlySum.one}
                  />
                </HeaderCell>
                <Cell>
                  {(rowData) => {
                    const { one } = calc(rowData as BookeeEntry);
                    return (
                      <span>
                        {one !== 0 ? `${one / 100}€` : "-"}{" "}
                        {one !== rowData.pOne ? `(${rowData.pOne / 100})` : ""}
                      </span>
                    );
                  }}
                </Cell>
              </Column>
              <Column width={150}>
                <HeaderCell>
                  <HeaderSummary
                    title={"" + localStorage.getItem("pTwo")}
                    summary={yearlySum.two}
                  />
                </HeaderCell>
                <Cell>
                  {(rowData) => {
                    const { two } = calc(rowData as BookeeEntry);
                    return (
                      <span>
                        {two !== 0 ? `${two / 100}€` : "-"}{" "}
                        {two !== rowData.pTwo ? `(${rowData.pTwo / 100})` : ""}
                      </span>
                    );
                  }}
                </Cell>
              </Column>
            </Table>
          </Panel>
          <Panel header="Monthly Difference" shaded>
            <Table
              virtualized
              height={400}
              headerHeight={65}
              data={monthlyDiff}
              onRowClick={(data) => {
                console.log(data);
              }}
            >
              <Column flexGrow={1}>
                <HeaderCell>Month</HeaderCell>
                <Cell dataKey="dateMonth" />
              </Column>
              <Column width={150}>
                <HeaderCell>
                  <HeaderSummary
                    title={"" + localStorage.getItem("pOne")}
                    summary={yearlySumDiff.one}
                  />
                </HeaderCell>
                <Cell>
                  {(rowData) => {
                    const { one } = calc(rowData as BookeeEntry);
                    return (
                      <span>
                        {one !== 0 ? `${one / 100}€` : "-"}{" "}
                        {one !== rowData.pOne ? `(${rowData.pOne / 100})` : ""}
                      </span>
                    );
                  }}
                </Cell>
              </Column>
              <Column width={150}>
                <HeaderCell>
                  <HeaderSummary
                    title={"" + localStorage.getItem("pTwo")}
                    summary={yearlySumDiff.two}
                  />
                </HeaderCell>
                <Cell>
                  {(rowData) => {
                    const { two } = calc(rowData as BookeeEntry);
                    return (
                      <span>
                        {two !== 0 ? `${two / 100}€` : "-"}{" "}
                        {two !== rowData.pTwo ? `(${rowData.pTwo / 100})` : ""}
                      </span>
                    );
                  }}
                </Cell>
              </Column>
            </Table>
          </Panel>
        </PanelWrapper>
      )}
    </>
  );
}

export default Dashboard;

const PanelWrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  div {
    flex: 1 1 400px;
    min-width: max-content;
  }
`;

const ButtonWrapper = styled.div`
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 1000;
`;
