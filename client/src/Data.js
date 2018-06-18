import 'babel-polyfill'
import React, { Component } from 'react'
import { Modal } from 'antd'
import { Input } from 'antd';
import { Button, Icon } from 'antd';
const { TextArea } = Input;


export default class Data extends Component {
    constructor() {
        super();
        this.state = {
            visible: false
        };
    }
    handleSaveData = (e) => {
        console.log(this.state.resourceContent)
        this.props.saveResource(this.state.resourceContent)
        this.setState({
            visible: false,
            resourceContent:''
        })
    }
    handleOnClick  = (e) => {
        this.setState({
            visible: true,
            resourceContent:''
        })
    }
    handleResourceDataChange(e) {
        this.setState({
            resourceContent: e.target.value
        });
    }
    render() {
        return (
            <div>
                <Button type="primary" icon="cloud" onClick={this.handleOnClick.bind(this)} className='upload'/>
                <Modal title='Add Data' visible={this.state.visible}
                    onOk={this.handleSaveData.bind(this)} onCancel={e => { this.setState({ visible: false }) }}>
                    <TextArea rows={4} onChange={this.handleResourceDataChange.bind(this)}/>
            </Modal>
            </div>)
    }

}
