import React from 'react';
import { StyleSheet, Text, View, StatusBar, Dimensions,
  TouchableOpacity } from 'react-native';
import { AppLoading } from 'expo';

import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import * as MediaLibrary from 'expo-media-library';

import { Entypo } from '@expo/vector-icons';


const { height, width } = Dimensions.get("window");
const ALBUM_NAME = "BigSMILE";

export default class App extends React.Component {
  state = {
    loaded: false,
    hasCameraPermission: null,
    hasCameraRollPermission: null,
    type: Camera.Constants.Type.back
  };  

  componentDidMount = async () => {
    this._loadApp();

    const { status } = await Permissions.askAsync(
      Permissions.CAMERA, 
      Permissions.CAMERA_ROLL);

    this.setState({ 
      hasCameraPermission: status === 'granted',
      hasCameraRollPermission: status === 'granted'
    });
    
  }

  render() {
    const { loaded, hasCameraPermission, hasCameraRollPermission, type } = this.state;

    if(!loaded) {
      return <AppLoading />;
    }
    else {
      if (hasCameraPermission === null || hasCameraRollPermission === null) {
        return <View />;

      } else if (hasCameraPermission === false || hasCameraRollPermission === false) {
        return (
          <View style={styles.container}>
            <Text>You're not allowed to use this app!</Text>
          </View>
        );

      } else {
        return (
          <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Text style={styles.title}>Make Big Smile :D</Text>
            <Camera 
              style={styles.camera}
              type={type}
              ref={ref => { this.camera = ref; }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  
                }}>
              </View>           
            </Camera>
            <View style={styles.cameraMenu}> 
              <TouchableOpacity
                onPress={() => {
                  this._takePhoto();
                }}>
                <View tyle={styles.captureButton}>  
                  <Entypo name="camera" size={50}/>
                </View>
              </TouchableOpacity>              
              <TouchableOpacity
                onPress={() => {
                  this._flipCamera();
                }}>
                <View style={styles.flipSwitch}>  
                  <Entypo name="switch" size={50}/>
                </View>
              </TouchableOpacity>    
            </View>          
          </View>
        );
      }

    }       
  }

  _loadApp = async () => {
    try {
      this.setState({
        loaded: true,
      });       
    } catch(err) {
      console.log(err);
    }  
  };

  _flipCamera () {
    const { type } = this.state;
    this.setState({
      type:
        type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back,
    });
  };

  _takePhoto = async () => {     
    try {
      const { uri, width, height, exif, base64 } = await this.camera.takePictureAsync();
      this._savePhoto(uri);
    } catch(err) {
      console.log(err);
    }
  };
  
  _savePhoto = async (uri) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);      
      const album = await MediaLibrary.getAlbumAsync(`${ALBUM_NAME}`);
      console.log(album);
      if(album === null) {
        await MediaLibrary.createAlbumAsync(`${ALBUM_NAME}`, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync(asset, album.id, false);
      }
    } catch(err) {
      console.log(err);
    }
  };
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 30,
    fontFamily: 'sans-serif-condensed',
    marginTop: 50,
    fontWeight: '500'
  },
  cameraMenu: {
    flexDirection: "row",
    marginBottom: 20
  },
  camera: {
    flex: 1,
    width: width - 50,
    marginTop: 50,
    marginBottom: 20
  },
  captureButton: {
    marginLeft: 20,
    marginRight: 10
  },
  flipSwitch: {
    marginLeft: 10,
    marginRight: 20
  }
});
