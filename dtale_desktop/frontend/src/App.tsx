import React, { useEffect, useReducer } from "react";
import { Layout, Button, PageHeader, Spin, Collapse, Tag, Space, Popover } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";
import "./App.css";
import DataSourceViewer from "./components/DataSourceViewer";
import SourceList from "./components/SourceList";
import ConfigEditor from "./components/SourceConfigEditor";
import { addSources, setSelectedSource } from "./store/actions";
import { reducer } from "./store/reducers";
import { initialState, DataSource } from "./store/state";
import { httpRequest } from "./utils/requests";

const { Content } = Layout;

const listPathsTemplate: string = `from typing import Iterable


def main() -> Iterable[str]:
    """
    Return an iterable of paths identifying where data is located, such as file paths or URLs.
    These paths will be passed to your function in get_data.py.
    """
    raise NotImplementedError()
`;

const getDataTemplate: string = `import pandas as pd


def main(path: str) -> pd.DataFrame:
    """
    Given a path, retrieve that data and return it as a pandas dataframe
    """
    raise NotImplementedError()
`;

const templateDataSource = (): DataSource => ({
  id: "",
  name: "",
  packageName: "",
  nodes: undefined,
  nodesFullyLoaded: false,
  error: null,
  visible: true,
  editable: true,
  listPaths: listPathsTemplate,
  getData: getDataTemplate,
  saveData: "",
});

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    httpRequest({
      method: "GET",
      url: "/source/list/",
      resolve: (sources) => dispatch(addSources(sources)),
      reject: (error) => null,
    });
  }, []);

  // const loadSourceNodes = (source: DataSource) => {
  //   dispatch(updateSource({ ...source, loading: true }));
  //   httpRequest({
  //     method: "POST",
  //     url: "/source/nodes/list/",
  //     body: source,
  //     resolve: (data) => dispatch(updateSource({ ...data, loading: false })),
  //     reject: (error) =>
  //       dispatch(updateSource({ ...source, loading: false, error: error })),
  //   });
  // };

  // useEffect(() => {
  //   if (state.sources !== undefined) {
  //     state.sources
  //       .filter(
  //         (source) =>
  //           !source.nodesFullyLoaded &&
  //           !source.loading &&
  //           Object.keys(source.nodes || {}).length === 0
  //       )
  //       .forEach((source) => {
  //         loadSourceNodes(source);
  //       });
  //   }
  // }, [state.sources]);

  return (
    <Layout className="layout">
      <Content style={{ width: "100vw" }}>
        <PageHeader
          title="D-Tale Desktop"
          className="site-page-header"
          subTitle=""
          extra={[
            <Button
              key="newDataSource"
              type="primary"
              onClick={() => {
                dispatch(setSelectedSource(templateDataSource()));
              }}
            >
              Add Data Source
            </Button>,
          ]}
        />
        <div style={{ width: "100%" }}>
          {state.sources === undefined ? (
            <Spin />
          ) : (
            <SourceList sources={state.sources} dispatch={dispatch} />
            // <Collapse defaultActiveKey={[]}>
            //   {state.sources.map((source) => (
            //     <SourcePanel source={source} dispatch={dispatch} key={source.id} />
                // <Collapse.Panel
                //   key={source.id}
                //   disabled={source.loading}
                //   header={
                //     <Space>
                //       <span>{source.name}</span>
                //       <Tag>
                //         {source.loading ? (
                //           <Spin size="small" />
                //         ) : (
                //           `${Object.keys(source.nodes || {}).length} results`
                //         )}
                //       </Tag>
                //       {!source.error ? null : (
                //         <Tag color="error">
                //           <Popover content={source.error} />
                //         </Tag>
                //       )}
                //       {!Object.values(source.nodes || {}).some(
                //         (node) => node.dtaleUrl
                //       ) ? null : (
                //         <Tag color="green">
                //           {`${
                //             Object.values(source.nodes || {}).filter(
                //               (node) => node.dtaleUrl
                //             ).length
                //           } active`}
                //         </Tag>
                //       )}
                //       {source.nodesFullyLoaded ? null : (
                //         <Button
                //           key={`${source.id}loadmore`}
                //           size="small"
                //           onClick={(event) => {
                //             event.stopPropagation();
                //             loadSourceNodes(source);
                //           }}
                //         >
                //           Load more
                //         </Button>
                //       )}
                //     </Space>
                //   }
                //   extra={
                //     <Button
                //       icon={<SettingOutlined />}
                //       onClick={(event) => {
                //         event.stopPropagation();
                //         dispatch(setSelectedSource(source));
                //       }}
                //     >
                //       Settings
                //     </Button>
                //   }
                // >
                //   <DataSourceViewer dispatch={dispatch} source={source} />
                // </Collapse.Panel>
            //   ))}
            // </Collapse>
          )}
        </div>
        {state.selectedSource ? (
          <ConfigEditor source={state.selectedSource} dispatch={dispatch} />
        ) : null}
      </Content>
    </Layout>
  );
};

export default App;
