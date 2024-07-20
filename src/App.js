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

function App() {
  const [theme, setTheme] = useState('default-light');
  const [initialized, setInitialized] = useState(false);
  const surveyRef = useRef(null);

  const saveSurveyState = (survey) => {
    if (!survey) return;

    const surveyState = {
      data: survey.data,
      currentPageNo: survey.currentPageNo,
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
    }
  };

  const alertResults = useCallback((sender) => {
    const results = JSON.stringify(sender.data);
    alert(results);
  }, []);

  useEffect(() => {
    if (!initialized) {
      const survey = new Model(surveyJson);
      surveyRef.current = survey;
      survey.onComplete.add(alertResults);

      // Apply the initial theme
      const currentTheme = theme === 'default-light' ? defaultLightTheme : defaultDarkTheme;
      survey.applyTheme(currentTheme);

      // Load survey state
      loadSurveyState(survey);

      // Ensure survey UI is updated
      setTimeout(() => {
        survey.render(); // Ensure survey UI is updated
      }, 0);

      setInitialized(true);
    }
  }, [alertResults, theme, initialized]);

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
  };

  return (
    <div>
      {initialized && surveyRef.current && <Survey model={surveyRef.current} />}
      <button
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#6200ea',
          color: '#fff',
          border: 'none',
          borderRadius: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
        onClick={toggleTheme}
      >
        Toggle Dark Mode
      </button>
    </div>
  );
}

export default App;
