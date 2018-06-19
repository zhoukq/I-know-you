import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal } from 'antd'
import * as config from '../../common/config'
const { DIRECTOR, PLAYER } = config



class Matrix extends Component {
    static defaultProps = {
        content: [
            'test', 'test', 'test', 'test', 'test',
            'test', 'test', 'test', 'test', 'test',
            'test', 'test', 'test', 'test', 'test',
            'test', 'test', 'test', 'test', 'test'
        ]
    }

    constructor() {
        super();
        this.state = {
            visible: false,
            selectedKey: -1
        };
    }

    contentTransform(content) {
        return content.reduce((total, item, cur) => {
            let realIndex = total.length - 1 > 0 ? total.length - 1 : 0
            if (total[realIndex].length < 5) {
                total[realIndex].push(item)
                return total
            } else {
                total.push([])
                total[realIndex + 1].push(item)
                return total
            }
        }, [[]])
    }

    handleMask(role, text, num) {
        if (this.props.mask != undefined && this.props.mask.get(num) == false) {
            return role === DIRECTOR ? `selected ${text}` : text
        }
        return text
    }

    onBlankClick = (event) => {
        this.setState({
            visible: true,
            selectedKey: event.target.getAttribute('id')
        })
    }

    handleOpenMask = (e) => {
        if (this.props.mask != null) {
            let mask = this.props.mask.map((v, i) => {
                return i == this.state.selectedKey ? false : v
            })
            this.props.updateMask(this.props.room, mask)
            this.setState({ visible: false })
        }
    }
    render() {
        return (
            <div className='calendar-body-box'>
                <table id='calendarTable' className='calendar-table'>
                    {this.contentTransform(this.props.content).map((row, i) => {
                        return <tbody key={i}><tr>
                            {row.map((v, j) => {
                                let key = i * 5 + j;
                                if (this.props.mask.get(key) === false || this.props.role === DIRECTOR) {
                                    if (v.team === 'red') {
                                        return <td key={key} id={key} className={this.handleMask(this.props.role,'red-team',key)}>{v.text}</td>
                                    } else if (v.team === 'green') {
                                        return <td key={key} id={key} className={this.handleMask(this.props.role,'green-team',key)}>{v.text}</td>
                                    } else if (v.team === 'useless') {
                                        return <td key={key} id={key} className={this.handleMask(this.props.role,'useless',key)}>{v.text}</td>
                                    } else {
                                        return <td key={key} id={key} className={this.handleMask(this.props.role,'bomb',key)}>{v.text}</td>
                                    }
                                } else {
                                    return <td key={key} id={key} onClick={this.onBlankClick.bind(this)}>{v.text}</td>
                                }
                            })}
                        </tr></tbody>
                    }
                    )}

                </table>
                <Modal title='Open' visible={this.state.visible}
                    onOk={this.handleOpenMask.bind(this)} onCancel={e => { this.setState({ visible: false }) }}>
                    <p>Are you serious?</p>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        content: state.get('content'),
        role: state.get('userConfig').role,
        room: state.get('userConfig').room,
        mask: state.get('userConfig').mask
    }
}

export default connect(
    mapStateToProps
)(Matrix)