import React from "react";

import { Placeholder } from "semantic-ui-react";
const mytab = [
  <Placeholder.Header image>
    <Placeholder.Line length="medium" />
    <Placeholder.Line length="full" />
  </Placeholder.Header>,
  <Placeholder.Header image>
    <Placeholder.Line length="medium" />
    <Placeholder.Line length="full" />
  </Placeholder.Header>,

  <Placeholder.Header image>
    <Placeholder.Line length="medium" />
    <Placeholder.Line length="full" />
  </Placeholder.Header>,
  <Placeholder.Header image>
    <Placeholder.Line length="medium" />
    <Placeholder.Line length="full" />
  </Placeholder.Header>,
  <Placeholder.Header image>
    <Placeholder.Line length="medium" />
    <Placeholder.Line length="full" />
  </Placeholder.Header>,
  <Placeholder.Header image>
    <Placeholder.Line length="medium" />
    <Placeholder.Line length="full" />
  </Placeholder.Header>
];
const Skeleton = () => {
  return (
    <React.Fragment>
      {mytab.map((tab, index) => (
        <Placeholder key={index}>{tab}</Placeholder>
      ))}
    </React.Fragment>
  );
};
export default Skeleton;
