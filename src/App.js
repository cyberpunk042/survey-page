import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import defaultLightTheme from 'survey-core/themes/default-light';
import defaultDarkTheme from 'survey-core/themes/default-dark';
import 'survey-core/defaultV2.min.css';

const surveyJson = {
  "title": "Cyberpunk042 Onboarding",
  "logoPosition": "right",
  "pages": [
    {
      "name": "initial_solution_selection",
      "title": "Welcome to the Needs Assessment Form",
      "elements": [
        {
          "type": "checkbox",
          "name": "solution_desired",
          "title": "What type of solution are you looking for?",
          "isRequired": true,
          "choices": [
            {
              "value": "application_server",
              "text": "Web Apps & Services Server"
            },
            {
              "value": "nas_server",
              "text": "Network Storage Server"
            },
            {
              "value": "custom_solution",
              "text": "Custom Solution"
            }
          ],
          "minSelectedChoices": 1
        },
        {
          "type": "radiogroup",
          "name": "combined_server_choice",
          "visibleIf": "{solution_desired} allof ['application_server', 'nas_server']",
          "title": "You have chosen Application and Storage Server.",
          "description": "You can either own your device with an increased upfront cost or pay for virtual resources with reduced monthly but increased long term cost.",
          "defaultValue": "one_device",
          "isRequired": true,
          "choices": [
            {
              "value": "cloud",
              "text": "Cloud (no device, all virtual resources)"
            },
            {
              "value": "one_device",
              "text": "1 Device (NAS and Applications together)"
            },
            {
              "value": "two_device",
              "text": "2 Devices (NAS and Applications separated)"
            }
          ]
        },
        {
          "type": "radiogroup",
          "name": "individual_server_choice",
          "visibleIf": "{solution_desired} anyof ['application_server', 'nas_server'] and {solution_desired} <> ['application_server', 'nas_server'] and {solution_desired} <> ['application_server', 'nas_server', 'custom_solution']",
          "title": "State your preference",
          "description": "You can either own your device with an increased upfront cost or pay for virtual resources with reduced monthly but increased long term cost.",
          "defaultValue": "one_device",
          "isRequired": true,
          "choices": [
            {
              "value": "cloud",
              "text": "Cloud (no device, all virtual resources)"
            },
            {
              "value": "one_device",
              "text": "Device (physical device, at hands)"
            }
          ]
        }
      ]
    },
    {
      "name": "application_server_details",
      "visibleIf": "{solution_desired} anyof ['application_server']",
      "title": "Application Server Details",
      "elements": [
        {
          "type": "checkbox",
          "name": "app_server_options",
          "title": "You have chosen Application Server.",
          "description": "We need to better understand your needs and level the playing field.",
          "choices": [
            {
              "value": "various_app",
              "text": "I want applications such as a CMS, an ERP, a Website, a Web Application or a Web Platform. (other variants apply) [One to Many]"
            },
            {
              "value": "home_server",
              "text": "I want an application such as Home Assistant and Automations."
            },
            {
              "value": "custom_app",
              "text": "I want to host my Own Application or Group of Applications."
            }
          ],
          "showOtherItem": true,
          "otherText": "Other (I am not very/fully conscious of what I want)"
        },
        {
          "type": "comment",
          "name": "app_server_requirements",
          "visibleIf": "{app_server_options.length} > 0",
          "title": "Please describe any specific functionality or user requirements for the application server."
        }
      ]
    },
    {
      "name": "nas_server_details",
      "visibleIf": "{solution_desired} anyof ['nas_server']",
      "title": "Network Storage Server Details",
      "elements": [
        {
          "type": "checkbox",
          "name": "nas_server_options",
          "title": "You have chosen Storage Server.",
          "description": "We need to better understand your needs and level the playing field.",
          "choices": [
            {
              "value": "cloud_file_solution",
              "text": "I want a cloud file solution like Google Drive, Dropbox, etc..."
            },
            {
              "value": "home_share_drive",
              "text": "I want a home share drive for my documents, videos, etc..."
            },
            {
              "value": "data_loss_prevention",
              "text": "I want to avoid loss of data at any possibilities. (critical)"
            }
          ],
          "choicesOrder": "asc"
        }
      ]
    },
    {
      "name": "device_specifications",
      "visibleIf": "{combined_server_choice} anyof ['one_device', 'two_device'] and {solution_desired} anyof ['application_server', 'nas_server']",
      "title": "Device Specifications",
      "elements": [
        {
          "type": "radiogroup",
          "name": "device_type",
          "title": "Please specify the type of device:",
          "choices": [
            {
              "value": "mini_servers",
              "text": "Mini-Servers (ARM, RISC, Zimablade, N100, RPI, etc.)"
            },
            {
              "value": "full_servers",
              "text": "Full-Servers (x86-64, Open Case, Tower, Rack Blade)"
            }
          ]
        },
        {
          "type": "comment",
          "name": "device_requirements",
          "visibleIf": "{device_type.length} > 0",
          "title": "Please describe any specific technical requirements or features for the device."
        }
      ]
    },
    {
      "name": "virtual_instance_specs",
      "visibleIf": "{combined_server_choice} anyof ['cloud'] or {individual_server_choice} = 'cloud'",
      "title": "Virtual Instance Specifications",
      "elements": [
        {
          "type": "radiogroup",
          "name": "virtual_device_specs",
          "title": "Please specify the type of virtual instance:",
          "choices": [
            {
              "value": "low_tier",
              "text": "Low tier (2 CPU)"
            },
            {
              "value": "mid_tier",
              "text": "Mid tier (4 CPU)"
            },
            {
              "value": "high_tier",
              "text": "High tier (8 CPU)"
            }
          ]
        },
        {
          "type": "comment",
          "name": "virtual_device_requirements",
          "visibleIf": "{virtual_device_specs.length} > 0",
          "title": "Please describe any specific technical requirements or features for the virtual instance."
        }
      ]
    },
    {
      "name": "custom_solution_type_selection",
      "visibleIf": "{solution_desired} allof ['custom_solution']",
      "title": "Custom Solution Type Selection",
      "elements": [
        {
          "type": "radiogroup",
          "name": "custom_solution_type",
          "title": "You have chosen a Custom Solution.",
          "description": "Please select the type of custom solution you are interested in:",
          "choices": [
            {
              "value": "custom_device",
              "text": "Custom Device"
            },
            {
              "value": "custom_application_platform",
              "text": "Custom Application or Platform"
            },
            {
              "value": "mesh_solutions",
              "text": "Mesh of Existing Solutions"
            }
          ]
        }
      ]
    },
    {
      "name": "custom_device_details",
      "visibleIf": "{custom_solution_type} = 'custom_device'",
      "title": "Custom Device Details",
      "elements": [
        {
          "type": "radiogroup",
          "name": "custom_device_type",
          "title": "Please specify the type of custom device:",
          "choices": [
            {
              "value": "mini_servers",
              "text": "Mini-Servers (ARM, RISC, Zimablade, N100, RPI, etc.)"
            },
            {
              "value": "full_servers",
              "text": "Full-Servers (x86-64, Open Case, Tower, Rack Blade)"
            },
            {
              "value": "socs",
              "text": "SoCs (ESP32, RP2040, Pico, etc.)"
            }
          ]
        },
        {
          "type": "checkbox",
          "name": "custom_device_options",
          "visibleIf": "{custom_device_type} notempty",
          "title": "Please specify your preferences for the custom device:",
          "choices": [
            {
              "value": "sensor_based",
              "text": "Sensor-based device"
            },
            {
              "value": "control_system",
              "text": "Control system device"
            },
            {
              "value": "communication_device",
              "text": "Communication device"
            },
            {
              "value": "3d_printed_parts",
              "text": "Modular 3D Case / Frame"
            },
            {
              "value": "usb_displays",
              "text": "Added USB Customizable Display (UI)"
            },
            {
              "value": "macro_keyboard",
              "text": "Added USB Macro-keyboard (Buttons)"
            }
          ]
        },
        {
          "type": "comment",
          "name": "custom_device_requirements",
          "visibleIf": "{custom_device_options.length} > 0",
          "title": "Please describe any specific technical requirements or features for the custom device."
        }
      ]
    },
    {
      "name": "custom_application_platform_details",
      "visibleIf": "{custom_solution_type} = 'custom_application_platform'",
      "title": "Custom Application/Platform Details",
      "elements": [
        {
          "type": "checkbox",
          "name": "custom_app_platform_options",
          "title": "You have chosen a Custom Application or Platform.",
          "description": "Please specify your preferences for the custom application or platform:",
          "choices": [
            {
              "value": "web_application",
              "text": "Web application"
            },
            {
              "value": "mobile_application",
              "text": "Mobile application"
            },
            {
              "value": "enterprise_platform",
              "text": "Enterprise platform"
            }
          ],
          "showOtherItem": true
        },
        {
          "type": "comment",
          "name": "custom_app_platform_requirements",
          "visibleIf": "{custom_app_platform_options.length} > 0",
          "title": "Please describe any specific functionality or user requirements for the custom application or platform."
        }
      ]
    },
    {
      "name": "mesh_solutions_details",
      "visibleIf": "{custom_solution_type} = 'mesh_solutions'",
      "title": "Mesh of Existing Solutions Details",
      "elements": [
        {
          "type": "checkbox",
          "name": "mesh_solutions_options",
          "title": "You have chosen a Mesh of Existing Solutions.",
          "description": "Please specify the solutions you are interested in integrating:",
          "choices": [
            {
              "value": "erp",
              "text": "ERP system"
            },
            {
              "value": "cms",
              "text": "CMS"
            },
            {
              "value": "crm",
              "text": "CRM"
            }
          ],
          "showOtherItem": true,
          "otherPlaceholder": "name them or their types",
          "otherText": "Other existing solutions"
        },
        {
          "type": "comment",
          "name": "mesh_solutions_requirements",
          "visibleIf": "{mesh_solutions_options.length} > 0",
          "title": "Please describe the integration requirements and existing systems."
        }
      ]
    }
  ]
};

const resetBtn = (onUserClick) => {
  //if(typeof survey !== "undefined" && survey !== null && survey.state === "completed"){
    return (
      <button className='reset-form-button' onClick={onUserClick}>Reset Form</button>
    )
  //}
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
    alert(results);
    
    setDisplayResetBtn(true);
  }, []);

  const initializeSurvey = useCallback(() => {
    const survey = new Model(surveyJson);
    surveyRef.current = survey;
    survey.onComplete.add(surveyCompleted);

    // Apply the initial theme
    const savedTheme = localStorage.getItem('savedTheme');
    if(savedTheme !== undefined && savedTheme != ""){
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
