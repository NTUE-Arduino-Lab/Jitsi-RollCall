import React, {useState, useEffect, Component} from 'react';

// import ProgressComponent from '@material-ui/core/CircularProgress';

class JitsiMeetComponent extends Component {
    constructor(props) {
        super(props);

        this.getNumberOfParticipant = this.getNumberOfParticipant.bind(this);
        this.onRoomNameChange = this.onRoomNameChange.bind(this);
        this.onParticipantLeft = this.onParticipantLeft.bind(this);
        this.onParticipantJoined = this.onParticipantJoined.bind(this);
        this.onParticipantDisplayNameChange = this.onParticipantDisplayNameChange.bind(this);
        this.onStartButtonClick = this.onStartButtonClick.bind(this);

        this.state = {
            loading: true,
            api: null,
            numberOfParticipants: 0,
            arrayOfUsers: [],
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

        const arrayOfUsers = this.state.arrayOfUsers;
        arrayOfUsers.push({id, displayName});

        // const arrayOfUsers = this.state.arrayOfUsers.concat({id, displayName});
        this.setState({
            arrayOfUsers
        })
    }

    onParticipantLeft({id}) {
        const arrayOfUsers = this.state.arrayOfUsers;
        const targetIndex = arrayOfUsers.findIndex(user => user.id === id );
        arrayOfUsers.splice(targetIndex, 1);
        this.setState({
            arrayOfUsers
        })
    }

    onParticipantDisplayNameChange({id, displayname}) {
        const arrayOfUsers = this.state.arrayOfUsers;
        const targetIndex = arrayOfUsers.findIndex(user => user.id === id );
        arrayOfUsers.splice(targetIndex, 1, {id, displayName: displayname});
        this.setState({
            arrayOfUsers
        })
    }

    getNumberOfParticipant() {
        if(!this.state.api)return;
        const numberOfParticipants = this.state.api.getNumberOfParticipants();
        this.setState({numberOfParticipants});
    };

    async onStartButtonClick() {
        if(!this.state.roomName) {
            alert('Enter the room name or conference exist');
            return;
        }
        if(this.state.api) {
            this.setState({
                api: null,
                arrayOfUsers: [],
            });
            this.state.api.dispose();
        }
        await this.startAndSetConferenceApi()
    }

    async startAndSetConferenceApi() {

        if(!this.state.roomName) {
            alert('Enter the room name or conference exist');
            return;
        }

        try {
            const domain = 'meet.jit.si';
            const options = {
                roomName: this.state.roomName,
                height: 400,
                parentNode: document.getElementById('jitsi-container'),
                interfaceConfigOverwrite: {
                    filmStripOnly: false,
                    SHOW_JITSI_WATERMARK: false,
                },
                configOverwrite: {
                    disableSimulcast: false,
                },
            };

            const api = new window.JitsiMeetExternalAPI(domain, options);

            api.addEventListener('videoConferenceJoined', () => {
                console.log('Local User Joined');
                // api.executeCommand('displayName', 'MyName');
            });
            api.addEventListener('participantJoined', this.onParticipantJoined);
            api.addEventListener('displayNameChange', this.onParticipantDisplayNameChange);
            api.addEventListener('participantLeft', this.onParticipantLeft);

            await this.setState({
                api,
                loading: false,
            });


            // return api;

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
                overflow: 'scroll'
            }}>
                <input value={this.state.roomName} onChange={this.onRoomNameChange} type="text" placeholder="input the room name..." />
                <button onClick={this.onStartButtonClick}>Start / Join</button>

                <div
                    style={containerStyle}
                >
                    {this.state.loading && <p>loading...</p>}
                    <div
                        id="jitsi-container"
                        style={{
                            display: this.state.loading ? 'none': 'block',
                            width: '100%',
                            height: '100%',
                            overflow: 'scroll'
                        }}
                    />
                </div>
                <p>{this.state.numberOfParticipants}</p>
                <button onClick={this.getNumberOfParticipant}>Get Participant numbers</button>

                {
                    this.state.arrayOfUsers.length > 0 && this.state.arrayOfUsers.map(({id, displayName}) => (
                        <>
                            <p>{id}</p>
                            <p>{displayName}</p>
                        </>
                    ))
                }

            </div>
        );
    }
}

const containerStyle = {
    width: '800px',
    height: '400px',
};

function JitsiMeetComponents() {

    const [loading, setLoading] = useState(true);

    const [numberOfParticipant, setNumberOfParticipant] = useState(0);
    const [api, setApi] = useState({});

    const containerStyle = {
        width: '800px',
        height: '400px',
    };

    const jitsiContainerStyle = {
        display: (loading ? 'none' : 'block'),
        width: '100%',
        height: '100%',
    };

    async function startConference() {
        try {
            const domain = 'meet.jit.si';
            const options = {
                roomName: 'roomName',
                height: 400,
                parentNode: document.getElementById('jitsi-container'),
                interfaceConfigOverwrite: {
                    filmStripOnly: false,
                    SHOW_JITSI_WATERMARK: false,
                },
                configOverwrite: {
                    disableSimulcast: false,
                },
            };

            const api = new window.JitsiMeetExternalAPI(domain, options);

            setApi(api);

            api.addEventListener('videoConferenceJoined', () => {
                console.log('Local User Joined');
                setLoading(false);
                api.executeCommand('displayName', 'MyName');
            });
            const devices = await api.getCurrentDevices();

            getNumberOfParticipant();
            // debugger;


        } catch (error) {
            console.error('Failed to load Jitsi API', error);
        }
    }

    useEffect(() => {
        // verify the JitsiMeetExternalAPI constructor is added to the global..
        if (window.JitsiMeetExternalAPI) startConference();
        else alert('Jitsi Meet API script not loaded');
    }, []);

    const getNumberOfParticipant = () => {
        const numberOfParticipants = api.getNumberOfParticipants();
        setNumberOfParticipant(numberOfParticipants);
    };

    return (
        <>
            <div
                style={containerStyle}
            >
                {loading && <p>loading...</p>}
                <div
                    id="jitsi-container"
                    style={jitsiContainerStyle}
                />
            </div>
            <p>{numberOfParticipant}</p>
            <button onClick={getNumberOfParticipant}>Get Participant numbers</button>
        </>
    );
}

export default JitsiMeetComponent;
