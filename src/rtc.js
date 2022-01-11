import React from "react";
import TRTC from "trtc-js-sdk";
import LibGenerateTestUserSig from "./assets/js/lib-generate-test-usersig.min";
import "./rtc.css";
function genTestUserSig(userID) {

    const SDKAPPID = 1400599849;
  

    const EXPIRETIME = 604800;

    const SECRETKEY = '5b3dbf79341fc254afb752d598b486ffae498ffe19b9c8b51191aec6700e33b1';
  
    // a soft reminder to guide developer to configure sdkAppId/secretKey
    if (SDKAPPID === '' || SECRETKEY === '') {
      alert(
        '请先配置好您的账号信息： SDKAPPID 及 SECRETKEY ' +
          '\r\n\r\nPlease configure your SDKAPPID/SECRETKEY in js/debug/GenerateTestUserSig.js'
      );
    }
    const generator = new LibGenerateTestUserSig(SDKAPPID, SECRETKEY, EXPIRETIME);
    const userSig = generator.genTestUserSig(userID);
    return {
      sdkAppId: SDKAPPID,
      userSig: userSig
    };
  }
  
// const client = TRTC.createClient({
//     mode: 'rtc',
//     sdkAppId: 1400599849,
//     userId: "test",
//     userSig: genTestUserSig("test"),
// });


class RTC extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            userID: "test",
            roomId:123,
        };
    }

    onSearchChange = (e) => {
        this.setState({
            userID: e.target.value
        })
    }

    onRoomChange = (e) => {
        this.setState({
            roomId: Number(e.target.value)
        })
    }

    createShareClient = () => {
        const shareClient = TRTC.createClient({
            mode: 'rtc',
            sdkAppId: 1400599849,
            userId: this.state.userID,
            userSig: this.state.sig.userSig,
        });
        this.setState({shareClient});
    }

    createShareStream = () => {
        
        const shareStream = TRTC.createStream({audio:false,screen:true,userId:`share-${this.state.userID}`});
        this.setState({shareStream})
    }

    publishShareStream = async () => {
        try{
            await this.state.shareStream.initialize();
        }catch(e){
            switch(e.name) {
                case 'NotReadableError':
                    alert('需允许浏览器访问屏幕')
                    return;
                case 'NotAllowedError':
                    if (e.message === 'Permission denied by system') {
                        alert('需允许浏览器访问屏幕');
                    } else {
                        alert('用户已拒绝');
                    }
                    return;
                default:
                    alert('未知错误');
                    return;
            }
        }finally{
            this.state.shareStream.play('local-share-stream');
        }

        this.state.shareClient.on('stream-added',event => {
            const remoteStream = event.stream;
            console.log('分享远端流增加:' + remoteStream.getId());
            this.state.shareClient.subscribe(remoteStream);
        });
        this.state.shareClient.on('stream-subscribed',event => {
            const remoteStream = event.stream;
            console.log('分享远端流订阅成功:' + remoteStream.getId());
            remoteStream.play('remote-share-video');
        });

        try {
            await this.state.shareClient.join({roomId:this.state.roomId});
        }catch(e){

        }

        

        try {
            await this.state.shareClient.publish(this.state.shareStream);
        }catch(e){

        }
    }
    
    createStrem  =  async () => {
        let cameraList =  await TRTC.getCameras();
        console.log(cameraList);
        let cameraId = cameraList[0].deviceId;
        const localStream = TRTC.createStream({
            userId:'test',audio:false,video:true,cameraId,
        });
        localStream
        .initialize()
        .catch(error => {
            console.error('初始化本地流失败'+error);
        })
        .then(()=>{
            console.log('初始化本地流成功');
        });

        localStream.play('camera-video');
        let sig = genTestUserSig(this.state.userID);
        let client = TRTC.createClient({
            mode: 'rtc',
            sdkAppId: 1400599849,
            userId: this.state.userID,
            userSig: sig.userSig,
        });

        this.setState({localStream,client,sig})
    }

    closeLocalStream = async () => {

        // this.state.localStream.close();
        // this.state.localStream.muteVideo();
        const videoTrack = this.state.localStream.getVideoTrack();
        if (videoTrack) {
            await this.state.localStream.replaceTrack(videoTrack);
            videoTrack.stop();
        }
    }

    joinRoom = () =>{


        this.state.client.join({
            roomId: Number(this.state.roomId),
        })
        .catch(error => {
            console.error('加入房间失败'+error);
        })
        .then(()=>{
            console.log('加入房间成功');
        });

        this.state.client.on('stream-added',event => {
            const remoteStream = event.stream;
            console.log('远端流增加:' + remoteStream.getId());
            this.state.client.subscribe(remoteStream);
        });
        this.state.client.on('stream-subscribed',event => {
            const remoteStream = event.stream;
            console.log('远端流订阅成功:' + remoteStream.getId());
            remoteStream.play('remote-video');
        });

        
    }

    subShareStream = () => {

    }
    render(){
        return(
            <div>
                <h1>RTC</h1>
                <h2>用户id: {this.state.userID}</h2>
                <h2>房间号: {this.state.roomId}</h2>
                <form>
                    <div className="userID">
                        <label>用户名</label>
                        <input type="text" onChange={this.onSearchChange}/>
                    </div>
                    <div className="roomId">
                        <label>房间号</label>
                        <input type="number" onChange={this.onRoomChange} />
                    </div>
                </form>
                <button type="button" onClick={this.createStrem}>
                    初始化本地流
                </button>
                <button type="button" onClick={this.closeLocalStream}>
                    关闭摄像头
                </button>
                <button type="button" onClick={this.joinRoom}>
                    加入房间
                </button>
                
                <div id="camera-video" >
                </div>
                <div id="remote-video" >
                </div>

                <br/>
                <div>
                    <button type="button" onClick={this.createShareClient}>
                        创建屏幕共享客户端
                    </button>
                    <button type="button" onClick={this.createShareStream}>
                        创建屏幕共享流
                    </button>
                    <button type="button" onClick={this.publishShareStream}>
                        发布屏幕共享流
                    </button>
                    <div id="local-share-stream" >
                    </div>
                    <div id="remote-share-stream" >
                    </div>
                </div>
            </div>
        )
    }
}
export default RTC;