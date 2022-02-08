import { useEffect, useState } from "react";
import {
  toaster,
  Uploader,
  Notification,
  Input,
  InputGroup,
  Col,
  FlexboxGrid,
  Panel,
  Button,
  IconButton,
} from "rsuite";
import { FaFileExport } from "react-icons/fa";
import { FileType } from "rsuite/esm/Uploader/Uploader";
import { usePapaParse, useCSVDownloader } from "react-papaparse";
import { scanImportedJson } from "../services/CsvService";
import { reciveAll } from "../services/DatabaseService";
import BookeeEntry from "../types/BookeeEntry";
import BookeeMod from "../types/BookeeMod";

function Settings() {
  const [pOne, setPOne] = useState<string>("");
  const [pTwo, setPTwo] = useState<string>("");
  const [csvBackup, setCsvBackup] = useState<any[]>([]);
  const [jsonBackup, setJsonBackup] = useState<string>("");

  const { readString } = usePapaParse();
  const { CSVDownloader, Type } = useCSVDownloader();
  const [files, setFiles] = useState<FileType[]>([]);

  const formatNumber = (num: number): string => {
    console.log((num / 100).toLocaleString());
    return (
      (num / 100).toLocaleString().replaceAll(",", "").replaceAll(".", ",") +
      "€"
    );
  };

  useEffect(() => {
    let newPOne = localStorage.getItem("pOne");
    let newPTwo = localStorage.getItem("pTwo");
    if (newPOne !== null) {
      setPOne(newPOne);
    } else {
      newPOne = "first";
    }
    if (newPTwo !== null) {
      setPTwo(newPTwo);
    } else {
      newPTwo = "second";
    }

    reciveAll("entries", (results: any[]) => {
      let newBackup: any[] = [];
      results.forEach((result: any) => {
        const res: BookeeEntry = result as BookeeEntry;
        newBackup.push({
          date: `${res.dateDay > 9 ? res.dateDay : "0" + res.dateDay}.${
            res.dateMonth > 9 ? res.dateMonth : "0" + res.dateMonth
          }.${res.dateYear}`,
          [newPOne + ""]: formatNumber(res.pOne),
          [newPTwo + ""]: formatNumber(res.pTwo),
        });
        res.mods.forEach((mod: BookeeMod) => {
          newBackup.push({
            date: "",
            [newPOne + ""]: mod.pOneMod ? formatNumber(mod.pOneMod) : "",
            [newPTwo + ""]: mod.pTwoMod ? formatNumber(mod.pTwoMod) : "",
          });
        });
      });
      setCsvBackup(newBackup);
      setJsonBackup(JSON.stringify(results));
    });
  }, []);

  const handleUpload = (file: FileType) => {
    if (file.blobFile) {
      let fileReader = new FileReader();
      fileReader.onloadend = function () {
        const content = fileReader.result;
        if (content !== null) {
          readString(content.toString(), {
            worker: true,
            complete: (results) => {
              console.log("Csv loaded from " + file.name);
              const csv: Array<any> = results.data;
              scanImportedJson(csv);
              console.log("---------");
            },
          });
        }
      };
      fileReader.readAsText(file.blobFile);
    }
  };

  const handleSuccess = (response: object, file: FileType) => {
    toaster.push(
      <Notification closable header={"Success"} type="success">
        Success: Imported {file.name}.
      </Notification>,
      { placement: "bottomStart" }
    );
  };

  const save = () => {
    localStorage.setItem("pOne", pOne);
    localStorage.setItem("pTwo", pTwo);
  };

  const exportAll = () => {
    let contentType = "application/json;charset=utf-8;";
    var a = document.createElement("a");
    a.download =
      "JsonBackup_" +
      new Date().getFullYear() +
      "." +
      (new Date().getMonth() + 1);
    a.href = "data:" + contentType + "," + encodeURIComponent(jsonBackup);
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <FlexboxGrid justify="space-around">
      <FlexboxGrid.Item as={Col} colspan={24} md={12}>
        <Panel header="Define pOne and pTwo">
          <InputGroup>
            <Input value={pOne} onChange={setPOne} />
            <InputGroup.Addon>pOne</InputGroup.Addon>
          </InputGroup>
          <InputGroup>
            <Input value={pTwo} onChange={setPTwo} />
            <InputGroup.Addon>pTwo</InputGroup.Addon>
          </InputGroup>
          <Button appearance="primary" onClick={save}>
            Save
          </Button>
        </Panel>
      </FlexboxGrid.Item>
      <FlexboxGrid.Item as={Col} colspan={24} md={12}>
        <Panel header="Import CSV">
          <Uploader
            fileList={files}
            action={"//jsonplaceholder.typicode.com/posts/"}
            draggable
            multiple
            autoUpload
            onUpload={handleUpload}
            onSuccess={handleSuccess}
            onChange={setFiles}
            accept={".csv"}
          >
            <div style={{ lineHeight: "100px" }}>
              Click or Drag files to this area to upload
            </div>
          </Uploader>
        </Panel>
      </FlexboxGrid.Item>
      <FlexboxGrid.Item as={Col} colspan={24} md={12}>
        <Panel header="Export CSV">
          <CSVDownloader
            type={Type.Button}
            filename={
              "CsvBackup_" +
              new Date().getFullYear() +
              "." +
              (new Date().getMonth() + 1)
            }
            bom={true}
            config={{
              delimiter: ";",
            }}
            data={csvBackup}
          >
            Download
          </CSVDownloader>
        </Panel>
      </FlexboxGrid.Item>
      <FlexboxGrid.Item as={Col} colspan={24} md={12}>
        <Panel header="Export Json">
          <IconButton icon={<FaFileExport />} onClick={() => exportAll()} />
        </Panel>
      </FlexboxGrid.Item>
    </FlexboxGrid>
  );
}

export default Settings;
