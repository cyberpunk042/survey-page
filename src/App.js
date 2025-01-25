import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import defaultLightTheme from 'survey-core/themes/default-light';
import defaultDarkTheme from 'survey-core/themes/default-dark';
import 'survey-core/defaultV2.min.css';
//import surveyJson from './app-server-applications-survey.json';

const resetBtn = (onUserClick) => {
    return (
      <button className='reset-form-button' onClick={onUserClick}>Reset Form</button>
    )
}
const lightModeSvg = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
      <path d="M272 384c9.6-31.9 29.5-59.1 49.2-86.2c0 0 0 0 0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4c0 0 0 0 0 0c19.8 27.1 39.7 54.4 49.2 86.2l160 0zM192 512c44.2 0 80-35.8 80-80l0-16-160 0 0 16c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z"/>
    </svg>
  )
}

const darkModeSvg = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
      <path d="M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7c0 0 0 0 0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5L109 384c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8c0 0 0 0 0 0s0 0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C27.6 247.9 16 213.3 16 176C16 78.8 94.8 0 192 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4c0 0 0 0 0 0s0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5l-48.6 0c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8c0 0 0 0 0 0s0 0 0 0s0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM192 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80l0-16 160 0 0 16c0 44.2-35.8 80-80 80z"/>
    </svg>
  )
}

function App() {
  const [theme, setTheme] = useState();
  const [initialized, setInitialized] = useState(false);
  const surveyRef = useRef(null);
  const [displayResetBtn, setDisplayResetBtn] = useState(false);

  const saveSurveyState = (survey) => {
    if (!survey) return;

    const surveyState = {
      data: survey.data,
      currentPageNo: survey.currentPageNo,
      state: survey.state,
      visiblePages: survey.pages.map(page => page.isVisible),
      questionStates: survey.getAllQuestions().map(question => ({
        name: question.name,
        value: question.value,
        isVisible: question.isVisible
      }))
    };
    localStorage.setItem('surveyState', JSON.stringify(surveyState));
  };

  const loadSurveyState = (survey) => {
    if (!survey) return;

    const retrievedSurveyState = localStorage.getItem('surveyState');
    if(retrievedSurveyState !== undefined && retrievedSurveyState !== "undefined"){
      const surveyState = JSON.parse(localStorage.getItem('surveyState'));
      if (surveyState) {
        survey.data = surveyState.data || {};
        survey.currentPageNo = surveyState.currentPageNo || 0;
        if (surveyState.visiblePages) {
          survey.pages.forEach((page, index) => {
            page.visible = surveyState.visiblePages[index];
          });
        }
        if (surveyState.questionStates) {
          surveyState.questionStates.forEach(state => {
            const question = survey.getQuestionByName(state.name);
            if (question) {
              question.value = state.value;
              question.visible = state.isVisible;
            }
          });
        }
        if(surveyState.state === "completed")
        {
          survey.doComplete();
        }
      }
    }
  };

  const surveyCompleted = useCallback((sender) => {
    saveSurveyState(surveyRef.current);
    const results = JSON.stringify(sender.data);
    formSubmission(results)
    //alert(results);
    console.log(results);
    
    setDisplayResetBtn(true);
  }, []);
 
  const currentSurvey = "onboarding_survey" // server_recipe_survey | onboarding_survey
  const base_url = "https://mcfrvucrnszaqkfaljrd.supabase.co"
  const params = new URLSearchParams(document.location.search);
  const initializeSurvey = useCallback(async() => {
    let surveyJson;
    if(currentSurvey === "device_survey" || currentSurvey === "server_recipe_survey" || currentSurvey ==="onboarding_survey"){

      const response = await fetch(`${base_url}/functions/v1/retrieve-survey?survey_name=${currentSurvey}&no_cache`)
      
      if (!response.ok) {
        throw new Error(`Error fetching clients: ${response.status} ${response.statusText}`);
      }
      surveyJson = await response.json();
    }
    if(!surveyJson){
      throw new Error(`Error: no survey json`);
    }
    const survey = new Model(surveyJson);
    surveyRef.current = survey;
    survey.onComplete.add(surveyCompleted);

    // Apply the initial theme
    const savedTheme = localStorage.getItem('savedTheme');
    if(savedTheme !== undefined && savedTheme !== ""){
      if(savedTheme === 'default-light'){
        setTheme('default-light');
      }
      else {
        setTheme('default-dark');
      }
    }else {
      setTheme('default-light');
    }
    // Load survey state
    loadSurveyState(survey);

    // Save state on value change
    survey.onValueChanged.add(() => {
      saveSurveyState(survey);
    });
    survey.onCurrentPageChanged.add(() => {
      saveSurveyState(survey);
    });

    
    // Ensure survey UI is updated
    setTimeout(() => {
      survey.render(); // Ensure survey UI is updated
    }, 0);

    setInitialized(true);
  }, [surveyCompleted, theme]);

  useEffect(() => {
    initializeSurvey();

    return () => {
      if (surveyRef.current) {
        saveSurveyState(surveyRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialized && surveyRef.current) {
      saveSurveyState(surveyRef.current);
      const currentTheme = theme === 'default-light' ? defaultLightTheme : defaultDarkTheme;
      surveyRef.current.applyTheme(currentTheme);
      loadSurveyState(surveyRef.current);
      setTimeout(() => {
        surveyRef.current.render(); // Ensure survey UI is updated
      }, 0);
    }
  }, [theme, initialized]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'default-light' ? 'default-dark' : 'default-light'));
    localStorage.setItem('savedTheme', theme === 'default-light' ? 'default-dark' : 'default-light');
  };
  const resetForm = () => {
    surveyRef.current.clear();
    localStorage.setItem('surveyState', undefined);
    setDisplayResetBtn(false);
  };
  const formSubmission = async(answers) => {
    const client_id = params.get("client_id");
    const response = await fetch(`${base_url}/functions/v1/receive-survey-data?survey_name=${currentSurvey}&client_id=${client_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({surveyResponse: answers})
    })
      
    if (!response.ok) {
      throw new Error(`Error fetching clients: ${response.status} ${response.statusText}`);
    }
    const surveySubmissionResponse = await response.json();
    if(!surveySubmissionResponse){
      throw new Error(`Error: no survey submission response`);
    }
    //TODO: re-enable
    //resetForm();
  };

  return (
    <div>
      {initialized && surveyRef.current && <Survey model={surveyRef.current} />}
      <button className='toggle-theme-button' onClick={toggleTheme}>
        {theme === 'default-light' ? lightModeSvg() : darkModeSvg()}
      </button>
      {displayResetBtn ? resetBtn(resetForm) : null}
    </div>
  );
}

export default App;
