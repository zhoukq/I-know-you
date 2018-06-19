import 'babel-polyfill'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Input } from 'antd';
import { Button, Icon } from 'antd';


class Reload extends Component {
    constructor() {
        super();
    }
    handleResetContent = (e) => {
        this.props.reloadContent(this.props.room)
        this.props.resetMask(this.props.room)
    }

    render() {
        return (
            <div>
                <Button type="primary" icon="reload" onClick={this.handleResetContent.bind(this)} className='upload'/>
            </div>)
    }
}

const mapStateToProps = (state) => {
    return {
        room: state.get('userConfig').room
    }
}

export default connect(
    mapStateToProps
)(Reload)
