import React, { useState } from "react";
import mime from  'mime-types'   

import { Modal, Input, Button, Icon } from "semantic-ui-react";

const FileModal = ({ closeModal, modal,uploadFile }) => {
  const [fileuploaded, setFile] = useState(null);
    const authorized  = ['image/jpeg','image/png'] 
  const addFile = event => {
    const file = event.target.files[0];
    console.log(file)
    if (file ){
        setFile(file)
    }
  };
 const  sendFile =()=>{ 

    if (fileuploaded!==null){
        if ( isAuthorized(fileuploaded.name)){
            const metadata = {
                ContentType : mime.lookup(fileuploaded.name)
            }
        uploadFile(fileuploaded,metadata)
        closeModal()
        setFile(null)
            }
    }
 }

 const isAuthorized =(name)=>authorized.includes(mime.lookup(name))

  return (
    <Modal basic open={modal} onClose={closeModal}>
      <Modal.Header>select an Image</Modal.Header>
      <Modal.Content>
        <Input
          fluid
          onChange={addFile}
          label="File types : jpg , png"
          name="file"
          type="file"
        />
      </Modal.Content>
      <Modal.Actions>
        
        <Button 
        onClick = { sendFile}
        color="green" inverted>
          <Icon name="checkmark"></Icon>
          send
        </Button>

        <Button onClick={closeModal} color="red" inverted>
          <Icon name="remove"></Icon>
          cancel
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
export default FileModal;
