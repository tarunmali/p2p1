import {React,useEffect,useContext} from "react"; 
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import { Grid, Typography, Paper, makeStyles } from '@material-ui/core';
import { SocketContext } from '../Context';

const useStyles = makeStyles((theme) => ({
    video: {
      width: '550px',
      [theme.breakpoints.down('xs')]: {
        width: '300px',
      },
    },
    gridContainer: {
      justifyContent: 'center',
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
      },
    },
    paper: {
      padding: '10px',
      border: '2px solid black',
      margin: '10px',
    },
  }));



const classifier = knnClassifier.create();

const webcamElement = document.getElementById('webcam');
let net;
var audio = new Audio('audio_file.mp3');


async function app() {
    console.log('Loading mobilenet..');
  
    // Load the model.
    net = await mobilenet.load();
    console.log('Sucessfully loaded model');
  
    await setupWebcam();
  
    // Reads an image from the webcam and associates it with a specific class
    // index.
    const addExample = classId => {
      // Get the intermediate activation of MobileNet 'conv_preds' and pass that
      // to the KNN classifier.
      const activation = net.infer(webcamElement, 'conv_preds');
  
      // Pass the intermediate activation to the classifier.
      classifier.addExample(activation, classId);
    };
  
    // When clicking a button, add an example for that class.
    document.getElementById('class-a').addEventListener('click', () => addExample(0));
    document.getElementById('class-b').addEventListener('click', () => addExample(1));
  
  
    while (true) {
      if (classifier.getNumClasses() > 0) {
        // Get the activation from mobilenet from the webcam.
        const activation = net.infer(webcamElement, 'conv_preds');
        // Get the most likely class and confidences from the classifier module.
        const result = await classifier.predictClass(activation);
  
        const classes = ['A', 'B'];
        if(classes[result.classIndex]=="B"){
          await audio.play();
          document.body.style.backgroundColor = "rgb(168, 63, 63)";
        }
        else{
          document.body.style.backgroundColor = "rgb(80, 168, 80)";
        }
      }
  
      await tf.nextFrame();
    }
  }
  
  async function setupWebcam() {
    return new Promise((resolve, reject) => {
      const navigatorAny = navigator;
      navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
      if (navigator.getUserMedia) {
        navigator.getUserMedia({ video: true },
          stream => {
            webcamElement.srcObject = stream;
            webcamElement.addEventListener('loadeddata', () => resolve(), false);
          },
          error => reject());
      } else {
        reject();
      }
    });
  }

function Ml ()
{
    // useEffect(() => {
    //     app();
    //   }, []);
      const { name, callAccepted, myVideo, userVideo, callEnded, stream, call } = useContext(SocketContext);
      const classes = useStyles();

      return (
        <Grid container className={classes.gridContainer}>
          {stream && (
            <Paper className={classes.paper}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>{name || 'Name'}</Typography>
                <video playsInline muted ref={myVideo} autoPlay className={classes.video} />
              </Grid>
            </Paper>
          )}
          {callAccepted && !callEnded && (
            <Paper className={classes.paper}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>{call.name || 'Name'}</Typography>
                <video playsInline ref={userVideo} autoPlay className={classes.video} />
              </Grid>
            </Paper>
          )}
        </Grid>
      );

    // return ( 
    //     <h1>Ml</h1>
    //     ); 
    }


export default Ml;