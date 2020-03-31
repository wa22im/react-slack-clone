import React from 'react';
import {
Progress
}
from 'semantic-ui-react'
const ProgressBar =({percentUploaded,uploadstate})=> 

uploadstate ==="uploading"&&
(
    <Progress
    className='progress__bar'
    percent={percentUploaded}
    content={uploadstate}
    indicating
    size="medium"
    inverted
    />)

export default ProgressBar