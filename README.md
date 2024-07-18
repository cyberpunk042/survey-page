# SurveyJS embedding with React static build

## Steps

### Use Form Builder
- Cloud: [Website](https://surveyjs.io/create-free-survey)
- Local: [Repository](https://github.com/surveyjs/code-examples/blob/main/get-started-creator/react/)

### Extract Survey JSON
- Get the JSON bloc from the Form builder
- Add it to [App.js](src/App.js) ```surveyJson.elements```

### NPM Package Build

```cmd
npm install
npm run build

cp ./build /share/survey-web-server-root-folder
```

________

#### Clone of:
https://github.com/surveyjs/code-examples/tree/main/get-started-library/react

##### Get Started with SurveyJS - React

This example is used in the following help topic: [Add a Survey to a React Application](https://surveyjs.io/Documentation/Library?id=get-started-react). It was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
