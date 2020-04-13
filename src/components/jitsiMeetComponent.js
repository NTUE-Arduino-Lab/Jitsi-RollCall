import React, {Component} from 'react';
import {ParticipantsTable} from "./participantsTable";
import {ExportCSV} from "../utils/exportCSV";
import Swal from 'sweetalert2'
import Button from 'react-bootstrap/Button';
import Spinner from "react-bootstrap/Spinner";
import Form from 'react-bootstrap/Form';

class JitsiMeetComponent extends Component {
    constructor(props) {
        super(props);

        this.getNumberOfParticipant = this.getNumberOfParticipant.bind(this);
        this.onRoomNameChange = this.onRoomNameChange.bind(this);
        this.onLocalUserJoined = this.onLocalUserJoined.bind(this);
        this.onParticipantLeft = this.onParticipantLeft.bind(this);
        this.onParticipantJoined = this.onParticipantJoined.bind(this);
        this.onParticipantDisplayNameChange = this.onParticipantDisplayNameChange.bind(this);
        this.onStartButtonClick = this.onStartButtonClick.bind(this);

        this.state = {
            initial: true,
            loading: true,
            api: null,
            numberOfParticipants: 0,
            participants: [],
            roomName: null,
        }

    }

    async componentDidMount() {
        // const api = await this.startConferenceAndGetApi();
        // api.addEventListener('videoConferenceJoined', () => {
        //     console.log('Local User Joined');
        //     // api.executeCommand('displayName', 'MyName');
        // });
        // api.addEventListener('participantJoined', this.onParticipantJoined);
        // api.addEventListener('displayNameChange', this.onParticipantDisplayNameChange);
        // api.addEventListener('participantLeft', this.onParticipantLeft);
        //
        // await this.setState({
        //     api,
        //     loading: false,
        // });
        // this.getNumberOfParticipant();
    }

    onParticipantJoined({id, displayName}) {

        console.log(id, displayName);

        let numberOfParticipants = this.state.numberOfParticipants;

        const participants = this.state.participants;
        participants.push({id, displayName});

        this.setState({
            participants,
            numberOfParticipants: numberOfParticipants + 1
        })
    }

    onParticipantLeft({id}) {
        const participants = this.state.participants;
        const targetIndex = participants.findIndex(user => user.id === id);
        participants.splice(targetIndex, 1);
        let numberOfParticipants = this.state.numberOfParticipants;

        this.setState({
            participants,
            numberOfParticipants: numberOfParticipants - 1
        })
    }

    onParticipantDisplayNameChange({id, displayname}) {
        const participants = this.state.participants;
        const targetIndex = participants.findIndex(user => user.id === id);
        participants.splice(targetIndex, 1, {id, displayName: displayname});
        this.setState({
            participants
        })
    }

    onLocalUserJoined() {
        console.log('Local user joined')
        let numberOfParticipants = this.state.numberOfParticipants;
        this.setState({
            numberOfParticipants: numberOfParticipants + 1
        })
    }

    getNumberOfParticipant(api) {
        if (!this.state.api && !api) return;
        let numberOfParticipants;
        if (this.state.api) {
            numberOfParticipants = this.state.api.getNumberOfParticipants();
            this.setState({numberOfParticipants});
        } else {
            return api.getNumberOfParticipants();
        }
    };

    async onStartButtonClick() {
        if (!this.state.roomName) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: '必須要輸入房間代號喔！',
                // footer: '<a href>Why do I have this issue?</a>'
            });
            return;
        }

        if (this.state.api) {
            this.setState({
                api: null,
                participants: [],
                numberOfParticipants: 0,
            });
            this.state.api.dispose();
        }
        await this.startAndSetConferenceApi()
    }

    async startAndSetConferenceApi() {
        try {
            const domain = 'meet.jit.si';
            const options = {
                roomName: this.state.roomName,
                height: 450,
                parentNode: document.getElementById('jitsi-container'),
                interfaceConfigOverwrite: {
                    filmStripOnly: false,
                    SHOW_JITSI_WATERMARK: false,
                },
                configOverwrite: {
                    disableSimulcast: false,
                },
            };

            const api = await new window.JitsiMeetExternalAPI(domain, options);

            api.addEventListener('videoConferenceJoined', this.onLocalUserJoined);
            api.addEventListener('participantJoined', this.onParticipantJoined);
            api.addEventListener('displayNameChange', this.onParticipantDisplayNameChange);
            api.addEventListener('participantLeft', this.onParticipantLeft);


            Swal.fire(
                'Good job!',
                `您所加入的房間名稱：${this.state.roomName}`,
                'success'
            );

            this.setState({
                api,
                loading: false,
                initial: false,
            });

        } catch (error) {
            console.error('Failed to load Jitsi API', error);
        }
    }

    onRoomNameChange(event) {
        this.setState({
            roomName: event.target.value
        })
    }

    render() {
        return (
            <div style={{
                width: '100%',
                height: '100%',
            }}>
                <div style={{marginTop: '1em', display: 'flex', alignItems: 'center'}}>
                    <Form.Group style={{flex: 1, marginTop: '1em', marginRight: '0.5em'}}>
                        <Form.Control value={this.state.roomName} onChange={this.onRoomNameChange} type="text"
                                      placeholder="input the room name..." inline={true}/>
                    </Form.Group>
                    <Button onClick={this.onStartButtonClick} variant="secondary" size="md">Start / Join</Button>
                </div>

                <div
                    style={containerStyle}
                >
                    {(!this.state.initial && this.state.loading)
                    && <Spinner animation="grow" variant="dark" size="lg"/>}
                    <div
                        id="jitsi-container"
                        style={{
                            display: this.state.loading ? 'none' : 'block',
                            width: '100%',
                            height: '100%',
                            overflow: 'scroll'
                        }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1em',
                }}>
                    <p className="text-primary" style={{margin: 0}}>在線人數（包含我）：{this.state.numberOfParticipants}</p>
                    <Button onClick={this.getNumberOfParticipant} variant="primary">刷新在線人數</Button>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1em',
                }}>
                    <h2>學生名單</h2>
                    <ExportCSV csvData={this.state.participants}
                               fileName={`${this.state.roomName}_${getDateFormatted()}`}/>
                </div>

                <div style={{
                    maxHeight: '22vh',
                    marginBottom: '1em',
                    overflow: 'scroll'
                }}>

                    <ParticipantsTable participants={this.state.participants}/>

                </div>
            </div>
        );
    }
}

const containerStyle = {
    width: '800px',
    height: '51vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1em'
};

const getDateFormatted = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    const day = date.getDate() < 10
        ? `0${date.getDate()}`
        : date.getDate() + 1; // date of month
    const hour = date.getHours();
    const minute = date.getMinutes();

    return `${year}${month}${day}:${hour}時:${minute}分`;
};

export default JitsiMeetComponent;
