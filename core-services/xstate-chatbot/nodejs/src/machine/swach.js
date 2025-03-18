const { assign } = require("xstate");
const { pgrService } = require("./service/service-loader");
const dialog = require("./util/dialog");
const localisationService = require("./util/localisation-service");
const config = require("../env-variables");

// swach
const swach = {
  id: "swach",
  initial: "swachmenu",
  onEntry: assign((context, event) => {
    context.slots.swach = {};
    context.swach = { slots: {} };
  }),
  states: {
    swachmenu: {
      id: "swachmenu",
      initial: "question",
      states: {
        question: {
          /*onEntry: assign( (context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.swachmenu.question, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process'
          }*/
          always: [
            {
              target: "#swachFileComplaint",
              cond: (context) =>
                context.intention == "file_new_swach_complaint",
            },
            {
              target: "#swachTrackComplaint",
              cond: (context) =>
                context.intention == "track_existing_swach_complaints",
            },
            {
              target: "error",
            },
          ],
        }, // swachmenu.question
        process: {
          onEntry: assign(
            (context, event) =>
              (context.intention = dialog.get_intention(
                grammer.swachmenu.question,
                event
              ))
          ),
          always: [
            {
              target: "#swachFileComplaint",
              cond: (context) =>
                context.intention == "file_new_swach_complaint",
            },
            {
              target: "#swachTrackComplaint",
              cond: (context) =>
                context.intention == "track_existing_swach_complaints",
            },
            {
              target: "error",
            },
          ],
        }, // swachmenu.process
        error: {
          onEntry: assign((context, event) =>
            dialog.sendMessage(
              context,
              dialog.get_message(
                dialog.global_messages.error.retry,
                context.user.locale
              ),
              false
            )
          ),
          always: "question",
        }, // swachmenu.error
      }, // swachmenu.states
    },

    // swachFileComplaint
    swachFileComplaint: {
      id: "swachFileComplaint",
      initial: "type",
      states: {
        type: {
          id: "type",
          initial: "swachComplaintType2Step",
          states: {
            swachcomplaintType: {
              id: "swachcomplaintType",
              initial: "question",
              states: {
                question: {
                  invoke: {
                    src: (context) =>{
                      return pgrService.fetchSwachFrequentComplaints(
                        context.extraInfo.tenantId
                      )},
                    id: "fetchSwachFrequentComplaints",
                    onDone: {
                      actions: assign((context, event) => {
                        let preamble = dialog.get_message(
                          messages.swachFileComplaint.swachcomplaintType
                            .question.preamble,
                          context.user.locale
                        );
                        let { complaintTypes, messageBundle } = event.data;
                        let { prompt, grammer } =
                          dialog.constructListPromptAndGrammer(
                            complaintTypes,
                            messageBundle,
                            context.user.locale,
                            true
                          );
                        context.grammer = grammer; // save the grammer in context to be used in next step
                        dialog.sendMessage(context, `${preamble}${prompt}`);
                      }),
                    },
                    onError: {
                      target: "#system_error",
                    },
                  },
                  on: {
                    USER_MESSAGE: "process",
                  },
                }, //question
                process: {
                  onEntry: assign((context, event) => {
                    context.intention = dialog.get_intention(
                      context.grammer,
                      event
                    );
                  }),
                  always: [
                    {
                      target: "#swachComplaintType2Step",
                      cond: (context) =>
                        context.intention == dialog.INTENTION_MORE,
                    },
                    {
                      target: "#swachLocation",
                      cond: (context) =>
                        context.intention != dialog.INTENTION_UNKOWN,
                      actions: assign((context, event) => {
                        return (context.slots.swach["complaint"] =
                          context.intention);
                      }),
                    },
                    {
                      target: "error",
                    },
                  ],
                }, // process
                error: {
                  onEntry: assign((context, event) => {
                    dialog.sendMessage(
                      context,
                      dialog.get_message(
                        dialog.global_messages.error.retry,
                        context.user.locale
                      ),
                      false
                    );
                  }),
                  always: "question",
                }, // error
              }, // states of complaintType
            }, // complaintType
            swachComplaintType2Step: {
              id: "swachComplaintType2Step",
              initial: "swachComplaintCategory",
              states: {
                swachComplaintCategory: {
                  id: "swachComplaintCategory",
                  initial: "question",
                  states: {
                    question: {
                      invoke: {
                        src: (context, event) =>{
                          return pgrService.fetchSwachComplaintCategories(
                            context.extraInfo.tenantId
                          )},
                        id: "fetchSwachComplaintCategories",
                        onDone: {
                          actions: assign((context, event) => {
                            let { complaintCategories, messageBundle } =
                              event.data;
                            let preamble = dialog.get_message(
                              messages.swachFileComplaint
                                .swachComplaintType2Step.category.question
                                .preamble,
                              context.user.locale
                            );
                            let { prompt, grammer } =
                              dialog.constructListPromptAndGrammer(
                                complaintCategories,
                                messageBundle,
                                context.user.locale
                              );

                            let lengthOfList = grammer.length;
                            let otherTypeGrammer = {
                              intention: "Others",
                              recognize: [(lengthOfList + 1).toString()],
                            };
                            prompt +=
                              `\n*${lengthOfList + 1}.* ` +
                              dialog.get_message(
                                messages.swachFileComplaint
                                  .swachComplaintType2Step.category.question
                                  .otherType,
                                context.user.locale
                              );
                            grammer.push(otherTypeGrammer);

                            context.grammer = grammer; // save the grammer in context to be used in next step
                            dialog.sendMessage(context, `${preamble}${prompt}`);
                          }),
                        },
                        onError: {
                          target: "#system_error",
                        },
                      },
                      on: {
                        USER_MESSAGE: "process",
                      },
                    }, //question
                    process: {
                      onEntry: assign((context, event) => {
                        context.intention = dialog.get_intention(
                          context.grammer,
                          event,
                          true
                        );
                      }),
                      always: [
                        {
                          target: "#swachOther",
                          cond: (context) => context.intention == "Others",
                          actions: assign((context, event) => {
                            return (context.slots.swach["complaint"] =
                              context.intention);
                          }),
                        },
                        {
                          target: "#swachComplaintItem",
                          cond: (context) =>
                            context.intention != dialog.INTENTION_UNKOWN,
                          actions: assign((context, event) => {
                            return (context.slots.swach["complaint"] =
                              context.intention);
                          }),
                        },
                        {
                          target: "error",
                        },
                      ],
                    }, // process
                    error: {
                      onEntry: assign((context, event) => {
                        dialog.sendMessage(
                          context,
                          dialog.get_message(
                            dialog.global_messages.error.retry,
                            context.user.locale
                          ),
                          false
                        );
                      }),
                      always: "question",
                    }, // error
                  }, // states of swachComplaintCategory
                }, // swachComplaintCategory
                swachComplaintItem: {
                  id: "swachComplaintItem",
                  initial: "question",
                  states: {
                    question: {
                      invoke: {
                        src: (context) => {
                          return pgrService.fetchSwatchComplaintItemsForCategory(
                            context.slots.swach.complaint,
                            context.extraInfo.tenantId
                          );
                        },
                        id: "fetchSwatchComplaintItemsForCategory",
                        onDone: {
                          actions: assign((context, event) => {
                            let { complaintItems, messageBundle } = event.data;

                            let preamble = dialog.get_message(
                              messages.swachFileComplaint
                                .swachComplaintType2Step.item.question.preamble,
                              context.user.locale
                            );

                            // let localisationPrefix = "CS_COMPLAINT_TYPE_";

                            // let complaintType =
                            //   localisationService.getMessageBundleForCode(
                            //     localisationPrefix +
                            //       context?.slots?.swach?.complaint?.toUpperCase()
                            //   );

                            let complaint = dialog.get_message(
                              context.slots.swach.complaint,
                              context.user.locale
                            );

                            preamble = preamble.replace(
                              "{{complaint}}",
                              complaint || context.slots.swach.complaint
                            );

                            // if (complaint != undefined)
                            //   preamble = preamble.replace(
                            //     "{{complaint}}",
                            //     complaint
                            //   );
                            // else
                            //   preamble = preamble.replace(
                            //     "{{complaint}}",
                            //     context.slots.swach.complaint
                            //   );

                            let { prompt, grammer } =
                              dialog.constructListPromptAndGrammer(
                                complaintItems,
                                messageBundle,
                                context.user.locale,
                                false,
                                true
                              );

                            // console.log("Constructed Prompt:", prompt); // Debugging
                            // console.log("Constructed Grammar:", grammer); // Debugging

                            context.grammer = grammer; // save the grammer in context to be used in next step
                            dialog.sendMessage(context, `${preamble}${prompt}`);
                          }),
                        },
                        onError: {
                          target: "#system_error",
                        },
                      },
                      on: {
                        USER_MESSAGE: "process",
                      },
                    }, //question
                    process: {
                      onEntry: assign((context, event) => {
                        context.intention = dialog.get_intention(
                          context.grammer,
                          event,
                          true
                        );
                      }),
                      always: [
                        {
                          target: "#swachComplaintCategory",
                          cond: (context) =>
                            context.intention == dialog.INTENTION_GOBACK,
                        },
                        {
                          target: "#swachOther",
                          cond: (context) =>
                            context.intention != dialog.INTENTION_UNKOWN,
                          actions: assign((context, event) => {
                            return (context.slots.swach["complaint"] =
                              context.intention);
                          }),
                        },
                        {
                          target: "error",
                        },
                      ],
                    }, // process
                    error: {
                      onEntry: assign((context, event) => {
                        dialog.sendMessage(
                          context,
                          dialog.get_message(
                            dialog.global_messages.error.retry,
                            context.user.locale
                          ),
                          false
                        );
                      }),
                      always: "question",
                    }, // error
                  }, // states of swachComplaintItem
                }, // swachComplaintItem
              }, // states of swachComplaintType2Step
            }, // swachComplaintType2Step
          },
        },
        swachLocation: {
          id: "swachLocation",
          initial: "swachGeoLocationSharingInfo",
          states: {
            swachGeoLocationSharingInfo: {
              id: "swachGeoLocationSharingInfo",
              onEntry: assign((context, event) => {
                var message = {
                  type: "image",
                  output: config.pgrUseCase.informationImageFilestoreId,
                };
                dialog.sendMessage(context, message);
              }),
              always: "swachGeoLocation",
            },
            swachGeoLocation: {
              id: "swachGeoLocation",
              initial: "question",
              states: {
                question: {
                  onEntry: assign((context, event) => {
                    let message = dialog.get_message(
                      messages.swachFileComplaint.swachGeoLocation.question,
                      context.user.locale
                    );
                    dialog.sendMessage(context, message);
                  }),
                  on: {
                    USER_MESSAGE: "process",
                  },
                },
                process: {
                  invoke: {
                    id: "getSwachCityAndLocality",
                    src: (context, event) => {
                      if (event.message.type === "location") {
                        context.slots.swach.geocode = event.message.input;
                        return pgrService.getCityAndLocalityForGeocode(
                          event.message.input,
                          context.extraInfo.tenantId
                        );
                      }
                      context.message = event.message.input;
                      return Promise.resolve();
                    },
                    onDone: [
                      {
                        target: "#swachConfirmLocation",
                        cond: (context, event) => event.data,
                        actions: assign((context, event) => {
                          context.swach.detectedLocation = event.data;
                        }),
                      },
                      {
                        target: "#city",
                        cond: (context, event) =>
                          !event.data &&
                          context.message === "1" &&
                          !config.pgrUseCase.geoSearch,
                      },
                      {
                        target: "#swachNLPCitySearch",
                        cond: (context, event) =>
                          !event.data &&
                          context.message === "1" &&
                          config.pgrUseCase.geoSearch,
                      },
                      {
                        target: "#swachGeoLocation",
                        cond: (context, event) =>
                          !event.data && context.message != "1",
                        actions: assign((context, event) => {
                          let message = dialog.get_message(
                            dialog.global_messages.error.retry,
                            context.user.locale
                          );
                          dialog.sendMessage(context, message, false);
                        }),
                      },
                    ],
                    onError: [
                      {
                        target: "#city",
                        cond: (context, event) => !config.pgrUseCase.geoSearch,
                      },
                      {
                        target: "#swachNLPCitySearch",
                        cond: (context, event) => config.pgrUseCase.geoSearch,
                      },
                    ],
                  },
                },
              },
            },
            swachConfirmLocation: {
              id: "swachConfirmLocation",
              initial: "question",
              states: {
                question: {
                  onEntry: assign((context, event) => {
                    let message;
                    if (context.swach.detectedLocation.locality) {
                      let localityName = dialog.get_message(
                        context.swach.detectedLocation
                          .matchedLocalityMessageBundle,
                        context.user.locale
                      );
                      message = dialog.get_message(
                        messages.swachFileComplaint.swachConfirmLocation
                          .confirmCityAndLocality,
                        context.user.locale
                      );
                      message = message.replace("{{locality}}", localityName);
                    } else {
                      message = dialog.get_message(
                        messages.swachFileComplaint.swachConfirmLocation
                          .confirmCity,
                        context.user.locale
                      );
                    }
                    let cityName = dialog.get_message(
                      context.swach.detectedLocation.matchedCityMessageBundle,
                      context.user.locale
                    );
                    message = message.replace("{{city}}", cityName);
                    dialog.sendMessage(context, message);
                  }),
                  on: {
                    USER_MESSAGE: "process",
                  },
                },
                process: {
                  onEntry: assign((context, event) => {
                    // TODO: Generalised "disagree" intention
                    if (event.message.input.trim().toLowerCase() === "1") {
                      context.slots.swach["locationConfirmed"] = false;
                      context.message = {
                        isValid: true,
                      };
                    } else if (
                      event.message.input.trim().toLowerCase() === "2"
                    ) {
                      context.slots.swach["locationConfirmed"] = true;
                      context.slots.swach.city =
                        context.swach.detectedLocation.city;
                      if (context.swach.detectedLocation.locality) {
                        context.slots.swach.locality =
                          context.swach.detectedLocation.locality;
                      }

                      context.message = {
                        isValid: true,
                      };
                    } else {
                      context.message = {
                        isValid: false,
                      };
                    }
                  }),
                  always: [
                    {
                      target: "#persistSwachComplaint",
                      cond: (context, event) =>
                        context.message.isValid &&
                        context.slots.swach["locationConfirmed"] &&
                        context.slots.swach["locality"],
                    },
                    {
                      target: "#locality",
                      cond: (context, event) =>
                        context.message.isValid &&
                        !config.pgrUseCase.geoSearch &&
                        context.slots.swach["locationConfirmed"],
                    },
                    {
                      target: "#swachNlpLocalitySearch",
                      cond: (context, event) =>
                        context.message.isValid &&
                        config.pgrUseCase.geoSearch &&
                        context.slots.swach["locationConfirmed"],
                    },
                    {
                      target: "#city",
                      cond: (context, event) =>
                        context.message.isValid && !config.pgrUseCase.geoSearch,
                    },
                    {
                      target: "#swachNLPCitySearch",
                      cond: (context, event) =>
                        context.message.isValid && config.pgrUseCase.geoSearch,
                    },
                    {
                      target: "process",
                      cond: (context, event) => {
                        return !context.message.isValid;
                      },
                    },
                  ],
                },
              },
            },
            swachNLPCitySearch: {
              id: "swachNLPCitySearch",
              initial: "question",
              states: {
                question: {
                  onEntry: assign((context, event) => {
                    let message = dialog.get_message(
                      messages.swachFileComplaint.swachCityFuzzySearch.question,
                      context.user.locale
                    );
                    dialog.sendMessage(context, message);
                  }),
                  on: {
                    USER_MESSAGE: "process",
                  },
                },
                process: {
                  invoke: {
                    id: "swachCityFuzzySearch",
                    src: (context, event) =>{
                      return pgrService.getCity(
                        event.message.input,
                        context.user.locale
                      )},
                    onDone: {
                      target: "route",
                      cond: (context, event) => event.data,
                      actions: assign((context, event) => {
                        let {
                          predictedCityCode,
                          predictedCity,
                          isCityDataMatch,
                        } = event.data;
                        context.slots.swach["predictedCityCode"] =
                          predictedCityCode;
                        context.slots.swach["predictedCity"] = predictedCity;
                        context.slots.swach["isCityDataMatch"] =
                          isCityDataMatch;
                        context.slots.swach["city"] = predictedCityCode;
                      }),
                    },
                    onError: {
                      target: "#system_error",
                    },
                  },
                },
                route: {
                  onEntry: assign((context, event) => {}),
                  always: [
                    {
                      target: "#swachNlpLocalitySearch",
                      cond: (context) =>
                        context.slots.swach["isCityDataMatch"] &&
                        context.slots.swach["predictedCity"] != null &&
                        context.slots.swach["predictedCityCode"] != null,
                    },
                    {
                      target: "#swachConfirmationFuzzyCitySearch",
                      cond: (context) =>
                        !context.slots.swach["isCityDataMatch"] &&
                        context.slots.swach["predictedCity"] != null &&
                        context.slots.swach["predictedCityCode"] != null,
                    },
                    {
                      target: "#swachNLPCitySearch",
                      cond: (context) =>
                        !context.slots.swach["isCityDataMatch"] &&
                        context.slots.swach["predictedCity"] == null &&
                        context.slots.swach["predictedCityCode"] == null,
                      actions: assign((context, event) => {
                        let message = dialog.get_message(
                          messages.swachFileComplaint.swachCityFuzzySearch
                            .noRecord,
                          context.user.locale
                        );
                        dialog.sendMessage(context, message);
                      }),
                    },
                  ],
                },
                swachConfirmationFuzzyCitySearch: {
                  id: "swachConfirmationFuzzyCitySearch",
                  initial: "question",
                  states: {
                    question: {
                      onEntry: assign((context, event) => {
                        let message = dialog.get_message(
                          messages.swachFileComplaint.swachCityFuzzySearch
                            .confirmation,
                          context.user.locale
                        );
                        message = message.replace(
                          "{{city}}",
                          context.slots.swach["predictedCity"]
                        );
                        dialog.sendMessage(context, message);
                      }),
                      on: {
                        USER_MESSAGE: "process",
                      },
                    },
                    process: {
                      onEntry: assign((context, event) => {
                        if (dialog.validateInputType(event, "text"))
                          context.intention = dialog.get_intention(
                            grammer.confirmation.choice,
                            event,
                            true
                          );
                        else context.intention = dialog.INTENTION_UNKOWN;
                      }),
                      always: [
                        {
                          target: "#swachNlpLocalitySearch",
                          cond: (context) => context.intention == "Yes",
                        },
                        {
                          target: "#swachNLPCitySearch",
                          cond: (context) => context.intention == "No",
                        },
                        {
                          target: "error",
                        },
                      ],
                    },
                    error: {
                      onEntry: assign((context, event) => {
                        let message = dialog.get_message(
                          dialog.global_messages.error.retry,
                          context.user.locale
                        );
                        dialog.sendMessage(context, message, false);
                      }),
                      always: "question",
                    },
                  },
                },
              },
            },
            swachNlpLocalitySearch: {
              id: "swachNlpLocalitySearch",
              initial: "question",
              states: {
                question: {
                  onEntry: assign((context, event) => {
                    let message = dialog.get_message(
                      messages.swachFileComplaint.swachNlpLocalitySearch
                        .question,
                      context.user.locale
                    );
                    dialog.sendMessage(context, message);
                  }),
                  on: {
                    USER_MESSAGE: "process",
                  },
                },
                process: {
                  invoke: {
                    id: "swachNlpLocalitySearch",
                    src: (context, event) =>{
                      return pgrService.getLocality(
                        event.message.input,
                        context.slots.swach["city"],
                        context.user.locale
                      )},
                    onDone: {
                      target: "route",
                      cond: (context, event) => event.data,
                      actions: assign((context, event) => {
                        let {
                          predictedLocalityCode,
                          predictedLocality,
                          isLocalityDataMatch,
                        } = event.data;
                        context.slots.swach["predictedLocalityCode"] =
                          predictedLocalityCode;
                        context.slots.swach["predictedLocality"] =
                          predictedLocality;
                        context.slots.swach["isLocalityDataMatch"] =
                          isLocalityDataMatch;
                        context.slots.swach["locality"] = predictedLocalityCode;
                      }),
                    },
                    onError: {
                      target: "#system_error",
                    },
                  },
                },
                route: {
                  onEntry: assign((context, event) => {}),
                  always: [
                    {
                      target: "#persistSwachComplaint",
                      cond: (context) =>
                        context.slots.swach["isLocalityDataMatch"] &&
                        context.slots.swach["predictedLocality"] != null &&
                        context.slots.swach["predictedLocalityCode"] != null,
                    },
                    {
                      target: "#swachConfirmationFuzzyLocalitySearch",
                      cond: (context) =>
                        !context.slots.swach["isLocalityDataMatch"] &&
                        context.slots.swach["predictedLocality"] != null &&
                        context.slots.swach["predictedLocalityCode"] != null,
                    },
                    {
                      target: "#swachNlpLocalitySearch",
                      cond: (context) =>
                        !context.slots.swach["isLocalityDataMatch"] &&
                        context.slots.swach["predictedLocality"] == null &&
                        context.slots.swach["predictedLocalityCode"] == null,
                      actions: assign((context, event) => {
                        let message = dialog.get_message(
                          messages.swachFileComplaint.swachNlpLocalitySearch
                            .noRecord,
                          context.user.locale
                        );
                        dialog.sendMessage(context, message);
                      }),
                    },
                  ],
                },
                swachConfirmationFuzzyLocalitySearch: {
                  id: "swachConfirmationFuzzyLocalitySearch",
                  initial: "question",
                  states: {
                    question: {
                      onEntry: assign((context, event) => {
                        let message = dialog.get_message(
                          messages.swachFileComplaint.swachNlpLocalitySearch
                            .confirmation,
                          context.user.locale
                        );
                        message = message.replace(
                          "{{locality}}",
                          context.slots.swach["predictedLocality"]
                        );
                        dialog.sendMessage(context, message);
                      }),
                      on: {
                        USER_MESSAGE: "process",
                      },
                    },
                    process: {
                      onEntry: assign((context, event) => {
                        if (dialog.validateInputType(event, "text"))
                          context.intention = dialog.get_intention(
                            grammer.confirmation.choice,
                            event,
                            true
                          );
                        else context.intention = dialog.INTENTION_UNKOWN;
                      }),
                      always: [
                        {
                          target: "#persistSwachComplaint",
                          cond: (context) => context.intention == "Yes",
                        },
                        {
                          target: "#swachNlpLocalitySearch",
                          cond: (context) => context.intention == "No",
                        },
                        {
                          target: "error",
                        },
                      ],
                    },
                    error: {
                      onEntry: assign((context, event) => {
                        let message = dialog.get_message(
                          dialog.global_messages.error.retry,
                          context.user.locale
                        );
                        dialog.sendMessage(context, message, false);
                      }),
                      always: "question",
                    },
                  },
                },
              },
            },
            city: {
              id: "city",
              initial: "question",
              states: {
                question: {
                  invoke: {
                    id: "fetchCities",
                    src: (context, event) =>{
                      return pgrService.fetchCitiesAndWebpageLink(
                        context.extraInfo.tenantId,
                        context.extraInfo.whatsAppBusinessNumber
                      )},
                    onDone: {
                      actions: assign((context, event) => {
                        let { cities, messageBundle, link } = event.data;
                        let preamble = dialog.get_message(
                          messages.swachFileComplaint.city.question.preamble,
                          context.user.locale
                        );
                        let message = preamble + "\n" + link;
                        let grammer = dialog.constructLiteralGrammer(
                          cities,
                          messageBundle,
                          context.user.locale
                        );
                        context.grammer = grammer;
                        dialog.sendMessage(context, message);
                      }),
                    },
                    onError: {
                      target: "#system_error",
                    },
                  },
                  on: {
                    USER_MESSAGE: "process",
                  },
                },
                process: {
                  onEntry: assign((context, event) => {
                    context.intention = dialog.get_intention(
                      context.grammer,
                      event
                    );
                  }),
                  always: [
                    {
                      target: "#locality",
                      cond: (context) =>
                        context.intention != dialog.INTENTION_UNKOWN,
                      actions: assign(
                        (context, event) =>
                          (context.slots.swach["city"] = context.intention)
                      ),
                    },
                    {
                      target: "error",
                    },
                  ],
                },
                error: {
                  onEntry: assign((context, event) => {
                    dialog.sendMessage(
                      context,
                      dialog.get_message(
                        dialog.global_messages.error.retry,
                        context.user.locale
                      ),
                      false
                    );
                  }),
                  always: "question",
                },
              },
            },
            locality: {
              id: "locality",
              initial: "question",
              states: {
                question: {
                  invoke: {
                    id: "fetchLocalities",
                    src: (context) =>{
                      return pgrService.fetchLocalitiesAndWebpageLink(
                        context.slots.swach.city,
                        context.extraInfo.whatsAppBusinessNumber
                      )},
                    onDone: {
                      actions: assign((context, event) => {
                        let { localities, messageBundle, link } = event.data;
                        let preamble = dialog.get_message(
                          messages.swachFileComplaint.locality.question
                            .preamble,
                          context.user.locale
                        );
                        let message = preamble + "\n" + link;
                        let grammer = dialog.constructLiteralGrammer(
                          localities,
                          messageBundle,
                          context.user.locale
                        );
                        context.grammer = grammer;
                        dialog.sendMessage(context, message);
                      }),
                    },
                    onError: {
                      target: "#system_error",
                    },
                  },
                  on: {
                    USER_MESSAGE: "process",
                  },
                },
                process: {
                  onEntry: assign((context, event) => {
                    return context.intention = dialog.get_intention(
                      context.grammer,
                      event
                    );
                  }),
                  always: [
                    {
                      target: "#persistSwachComplaint",
                      cond: (context) =>
                        context.intention != dialog.INTENTION_UNKOWN,
                      actions: assign(
                        (context, event) =>
                          (context.slots.swach["locality"] = context.intention)
                      ),
                    },
                    {
                      target: "error",
                    },
                  ],
                },
                error: {
                  onEntry: assign((context, event) => {
                    dialog.sendMessage(
                      context,
                      dialog.get_message(
                        dialog.global_messages.error.retry,
                        context.user.locale
                      ),
                      false
                    );
                  }),
                  always: "question",
                },
              },
            },
            landmark: {
              // come here when user 1) did not provide geolocation or 2) did not confirm geolocation - either because google maps got it wrong or if there was a google api error
            },
          },
        },
        swachOther: {
          // get other info
          id: "swachOther",
          initial: "imageUpload",
          states: {
            imageUpload: {
              id: "imageUpload",
              initial: "question",
              states: {
                question: {
                  onEntry: assign((context, event) => {
                    let message = dialog.get_message(
                      messages.swachFileComplaint.imageUpload.question,
                      context.user.locale
                    );
                    dialog.sendMessage(context, message);
                  }),
                  on: {
                    USER_MESSAGE: "process",
                  },
                },
                process: {
                  onEntry: assign((context, event) => {
                    if (dialog.validateInputType(event, "image")) {
                      context.slots.swach.image = event.message.input;
                      context.message = {
                        isValid: true,
                      };
                    } else {
                      let parsed = event.message.input;
                      let isValid = parsed === "1";
                      context.message = {
                        isValid: isValid,
                        messageContent: event.message.input,
                      };
                    }
                  }),
                  always: [
                    {
                      target: "error",
                      cond: (context, event) => {
                        return !context.message.isValid;
                      },
                    },
                    {
                      target: "#swachLocation",
                      cond: (context, event) => {
                        return context.message.isValid;
                      },
                    },
                  ],
                },
                error: {
                  onEntry: assign((context, event) => {
                    let message = dialog.get_message(
                      dialog.global_messages.error.retry,
                      context.user.locale
                    );
                    dialog.sendMessage(context, message, false);
                  }),
                  always: "question",
                },
              },
            },
          },
        },
        persistSwachComplaint: {
          id: "persistSwachComplaint",
          invoke: {
            id: "persistSwachComplaint",
            src: (context) => {
              return pgrService.persistSwachComplaint(
                context.user,
                context.slots.swach,
                context.extraInfo
              );
            },
            onDone: {
              target: "#endstate",
              actions: assign((context, event) => {
                let templateList;
                let complaintDetails = event.data;
                let message = dialog.get_message(
                  messages.swachFileComplaint.persistSwachComplaint,
                  context.user.locale
                );
                message = message.replace(
                  "{{complaintNumber}}",
                  complaintDetails?.complaintNumber
                );
                message = message.replace(
                  "{{complaintLink}}",
                  complaintDetails?.complaintLink
                );
                let closingStatement = dialog.get_message(
                  messages.swachFileComplaint.closingStatement,
                  context.user.locale
                );
                message = message + closingStatement;
                dialog.sendMessage(context, message);
              }),
            },
          },
        },
      }, // swachFileComplaint.states
    },

    // swachTrackComplaint
    swachTrackComplaint: {
      id: "swachTrackComplaint",
      invoke: {
        id: "fetchOpenSwachComplaints",
        src: (context) => {return pgrService.fetchOpenSwachComplaints(context.user)},
        onDone: [
          {
            target: "#endstate",
            cond: (context, event) => {
              return event.data.length > 0;
            },
            actions: assign((context, event) => {
              (async () => {
                let templateList;
                let localeList = config.supportedLocales.split(",");
                let localeIndex = localeList.indexOf(context.user.locale);
                templateList =
                  config.valueFirstWhatsAppProvider.valuefirstNotificationTrackCompliantTemplateid.split(
                    ","
                  );

                if (templateList[localeIndex])
                  context.extraInfo.templateId = templateList[localeIndex];
                else context.extraInfo.templateId = templateList[0];

                let complaints = event.data;
                var preamble = dialog.get_message(
                  messages.swachTrackComplaint.results.preamble,
                  context.user.locale
                );
                dialog.sendMessage(context, preamble, true);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                for (let i = 0; i < complaints.length; i++) {
                  let template = dialog.get_message(
                    messages.swachTrackComplaint.results.complaintTemplate,
                    context.user.locale
                  );
                  let complaint = complaints[i];
                  template = template.replace(
                    "{{complaintType}}",
                    complaint.swachcomplaintType
                  );
                  template = template.replace(
                    "{{filedDate}}",
                    complaint.filedDate
                  );
                  template = template.replace(
                    "{{complaintStatus}}",
                    complaint.complaintStatus
                  );
                  template = template.replace(
                    "{{complaintLink}}",
                    complaint.complaintLink
                  );

                  dialog.sendMessage(context, template, true);
                  // params.push(complaint.complaintType);
                  // params.push(complaint.complaintNumber);
                  // params.push(complaint.filedDate);
                  // params.push(complaint.complaintStatus);

                  // let urlComponemt = complaint.complaintLink.split('/');
                  // let bttnUrlComponent = urlComponemt[urlComponemt.length -1];

                  // var templateContent = {
                  //  output: context.extraInfo.templateId,
                  //  type: "template",
                  //  params: params,
                  //  bttnUrlComponent: bttnUrlComponent
                  // };

                  // dialog.sendMessage(context, templateContent, true);
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
                var closingStatement = dialog.get_message(
                  messages.swachTrackComplaint.results.closingStatement,
                  context.user.locale
                );
                dialog.sendMessage(context, closingStatement, true);
              })();
            }),
          },
          {
            target: "#endstate",
            actions: assign((context, event) => {
              let message = dialog.get_message(
                messages.swachTrackComplaint.noRecords,
                context.user.locale
              );
              dialog.sendMessage(context, message);
            }),
          },
        ],
      },
    },
  }, // swach.states
};

// messages
let messages = {
  swachmenu: {
    question: {
      en_IN:
        "Please type and send the number for your option 👇\n\n1. File New Complaint.\n2. Track Old Complaints.",
      hi_IN:
        " सेवा का चयन करने के लिए प्रासंगिक विकल्प संख्या टाइप करें और भेजें 👇\n\n1. शिकायत दर्ज करें\n2. शिकायतों को ट्रैक करें",
    },
  },

  // swach file complaint
  swachFileComplaint: {
    swachcomplaintType: {
      question: {
        preamble: {
          en_IN:
            "What is the complaint about ? Please type and send the number of your option 👇",
          hi_IN: "कृपया अपनी शिकायत के लिए नंबर दर्ज करें",
        },
        other: {
          en_IN: "Other ...",
          hi_IN: "कुछ अन्य ...",
        },
      },
    }, // complaintType
    swachComplaintType2Step: {
      category: {
        question: {
          preamble: {
            en_IN:
              "Please type and send the number to select a complaint type from the list below 👇\n",
            hi_IN:
              "नीचे दी गई सूची से शिकायत प्रकार चुनने के लिए विकल्प संख्या टाइप करें और भेजें 👇",
          },
          otherType: {
            en_IN: "Others",
            hi_IN: "अन्य",
          },
        },
      },
      item: {
        question: {
          preamble: {
            en_IN: "What is the problem you are facing with {{complaint}}?\n",
            hi_IN: "आपको {{complaint}} से क्या समस्या आ रही है",
            pa_IN: "{{complaint}} ਨਾਲ ਤੁਸੀਂ ਕਿਸ ਸਮੱਸਿਆ ਦਾ ਸਾਹਮਣਾ ਕਰ ਰਹੇ ਹੋ",
          },
        },
      },
    }, // swachComplaintType2Step
    swachGeoLocation: {
      question: {
        en_IN:
          "Please share your location if you are at the grievance site.\n\n👉  Refer the image below to understand steps for sharing the location.\n\n👉  To continue without sharing the location, type and send  *1*.",
        hi_IN:
          "यदि आप शिकायत स्थल पर हैं तो कृपया अपना स्थान साझा करें।\n\n👉 स्थान साझा करने के चरणों को समझने के लिए नीचे दी गई छवि देखें।\n\n👉 स्थान साझा किए बिना जारी रखने के लिए, टाइप करें और 1 भेजें।",
        pa_IN:
          "ਜੇ ਤੁਸੀਂ ਸ਼ਿਕਾਇਤ ਵਾਲੀ ਥਾਂ ਤੇ ਹੋ ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਥਾਨ ਸਾਂਝਾ ਕਰੋ.\n\n👉 ਸਥਾਨ ਨੂੰ ਸਾਂਝਾ ਕਰਨ ਦੇ ਕਦਮਾਂ ਨੂੰ ਸਮਝਣ ਲਈ ਹੇਠ ਦਿੱਤੇ ਚਿੱਤਰ ਨੂੰ ਵੇਖੋ.\n\n👉 ਨਿਰਧਾਰਤ ਸਥਾਨ ਸਾਂਝਾ ਕੀਤੇ ਬਗੈਰ ਜਾਰੀ ਰੱਖਣ ਲਈ, 1 ਲਿਖੋ ਅਤੇ ਭੇਜੋ.",
      },
    }, // swachGeoLocation
    swachConfirmLocation: {
      confirmCityAndLocality: {
        en_IN:
          "Is this the correct location of the complaint?\nCity: {{city}}\nLocality: {{locality}}\n\nType and send *1* if it is incorrect\nElse, type and send *2* to confirm and proceed",
        hi_IN:
          "क्या यह शिकायत का सही स्थान है?शहर: {{city}}स्थान: {{locality}}\n\nटाइप करें और 1 भेजें यदि यह गलत है\nअन्यथा, पुष्टि करने और आगे बढ़ने के लिए 2 टाइप करें और भेजें",
        pa_IN:
          "ਕੀ ਇਹ ਸ਼ਿਕਾਇਤ ਦਾ ਸਹੀ ਸਥਾਨ ਹੈ?ਸ਼ਹਿਰ: {{city}}ਸਥਾਨ: {{locality}}\n\nਟਾਈਪ ਕਰੋ ਅਤੇ 1 ਭੇਜੋ ਜੇ ਇਹ ਗਲਤ ਹੈ\nਹੋਰ, ਪੁਸ਼ਟੀ ਕਰਨ ਅਤੇ ਅੱਗੇ ਵਧਣ ਲਈ ਟਾਈਪ ਕਰੋ ਅਤੇ 2 ਭੇਜੋ",
      },
      confirmCity: {
        en_IN:
          "Is this the correct location of the complaint?\nCity: {{city}}\n\nType and send *1* if it is incorrect\nElse, type and send *2* to confirm and proceed",
        hi_IN:
          'क्या यह शिकायत का सही स्थान है? \nशहर: {{city}}\n अगर यह गलत है तो कृपया "No" भेजें।\nअन्यथा किसी भी चरित्र को टाइप करें और आगे बढ़ने के लिए भेजें।',
      },
    },
    city: {
      question: {
        preamble: {
          en_IN:
            "Please select your city from the link given below. Tap on the link to search and select your city.",
          hi_IN:
            "कृपया नीचे दिए गए लिंक से अपने शहर का चयन करें। अपने शहर को खोजने और चुनने के लिए लिंक पर टैप करें।",
        },
      },
    }, // city
    locality: {
      question: {
        preamble: {
          en_IN:
            "Please select the locality of your complaint from the link below. Tap on the link to search and select a locality.",
          hi_IN:
            "कृपया नीचे दिए गए लिंक से अपनी शिकायत के इलाके का चयन करें। किसी इलाके को खोजने और चुनने के लिए लिंक पर टैप करें।",
        },
      },
    }, // locality
    imageUpload: {
      question: {
        en_IN:
          "If possible, attach a photo of your grievance.\n\nTo continue without photo, type and send *1*",
        hi_IN:
          "यदि संभव हो तो अपनी शिकायत का फोटो संलग्न करें।\n\nफोटो के बिना जारी रखने के लिए, टाइप करें और 1 भेजें",
        pa_IN: " ਨਾਮ ਦੀ ਪੁਸ਼ਟੀ ਕਰਨ ਲਈ 1 ਟਾਈਪ ਕਰੋ ਅਤੇ ਭੇਜੋ",
      },
      error: {
        en_IN: "Sorry, I didn't understand",
        hi_IN: "क्षमा करें, मुझे समझ नहीं आया ।",
      },
    },
    persistSwachComplaint: {
      en_IN:
        "Thank You 😃 Your complaint is registered successfully with mSeva.\n\nThe Complaint No is : *{{complaintNumber}}*\n\nClick on the link below to view and track your complaint:\n{{complaintLink}}\n",
      hi_IN:
        "धन्यवाद 😃 आपकी शिकायत mSeva के साथ सफलतापूर्वक दर्ज हो गई है।\nशिकायत संख्या है: {{complaintNumber}}\n अपनी शिकायत देखने और ट्रैक करने के लिए नीचे दिए गए लिंक पर क्लिक करें:\n {{complaintLink}}\n",
      pa_IN:
        "ਧੰਨਵਾਦ 😃 ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ mSeva ਨਾਲ ਸਫਲਤਾਪੂਰਵਕ ਰਜਿਸਟਰ ਹੋਈ ਹੈ.\nਸ਼ਿਕਾਇਤ ਨੰਬਰ ਹੈ: {{complaintNumber}}\n ਆਪਣੀ ਸ਼ਿਕਾਇਤ ਨੂੰ ਵੇਖਣ ਅਤੇ ਟਰੈਕ ਕਰਨ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਲਿੰਕ ਤੇ ਕਲਿੱਕ ਕਰੋ:\n {{complaintLink}}\n",
    },
    closingStatement: {
      en_IN: '\nIn case of any help please type and send "mseva"',
      hi_IN: '\nकिसी भी मदद के मामले में कृपया "mseva" टाइप करें और भेजें',
      pa_IN: "\nਕਿਸੇ ਵੀ ਮਦਦ ਦੀ ਸਥਿਤੀ ਵਿੱਚ, ਕਿਰਪਾ ਕਰਕੇ ਟਾਈਪ ਕਰੋ ਅਤੇ ਭੇਜੋ",
    },
    swachCityFuzzySearch: {
      question: {
        en_IN:
          "Enter the name of your city.\n\n(For example - Jalandhar, Amritsar, Ludhiana)",
        hi_IN:
          "अपने शहर का नाम दर्ज करें। (उदाहरण के लिए - जालंधर, अमृतसर, लुधियाना)",
        pa_IN:
          "ਆਪਣੇ ਸ਼ਹਿਰ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ. (ਉਦਾਹਰਣ ਵਜੋਂ - ਜਲੰਧਰ, ਅੰਮ੍ਰਿਤਸਰ, ਲੁਧਿਆਣਾ",
      },
      confirmation: {
        en_IN:
          "Did you mean *“{{city}}”* ?\n\n👉  Type and send *1* to confirm.\n\n👉  Type and send *2* to write again.",
        hi_IN:
          "क्या आपका मतलब *“{{city}}”* से था ?\n\n👉 टाइप करें और पुष्टि करने के लिए 1 भेजें।\n\n👉 टाइप करें और फिर से लिखने के लिए 2 भेजें।",
        pa_IN:
          "ਕੀ ਤੁਹਾਡਾ ਮਤਲਬ *“{{city}}”* ਹੈ ?\n\n👉 ਪੁਸ਼ਟੀ ਕਰਨ ਲਈ 1 ਲਿਖੋ ਅਤੇ ਭੇਜੋ.\n\n👉 ਟਾਈਪ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਲਿਖਣ ਲਈ 2 ਭੇਜੋ.",
      },
      noRecord: {
        en_IN:
          "Provided city is miss-spelled or not present in our system record.\nPlease enter the details again.",
        hi_IN:
          "आपके द्वारा दर्ज किया गया शहर गलत वर्तनी वाला है या हमारे सिस्टम रिकॉर्ड में मौजूद नहीं है।\nकृपया फिर से विवरण दर्ज करें।",
      },
    },
    swachNlpLocalitySearch: {
      question: {
        en_IN: "Enter the name of your locality.\n\n(For example - Ajit Nagar)",
        hi_IN: "अपने इलाके का नाम दर्ज करें। (उदाहरण के लिए - अजीत नगर)",
        pa_IN: "ਆਪਣੇ ਸਥਾਨ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ. (ਉਦਾਹਰਣ ਵਜੋਂ - ਅਜੀਤ ਨਗਰ)",
      },
      confirmation: {
        en_IN:
          "Did you mean *“{{locality}}”* ?\n\n👉  Type and send *1* to confirm.\n\n👉  Type and send *2* to write again.",
        hi_IN:
          "क्या आपका मतलब *“{{locality}}”* से था ?\n\n👉 टाइप करें और पुष्टि करने के लिए 1 भेजें।\n\n👉 टाइप करें और फिर से लिखने के लिए 2 भेजें।",
        pa_IN:
          "ਕੀ ਤੁਹਾਡਾ ਮਤਲਬ *“{{locality}}”* ਹੈ ?\n\n👉 ਪੁਸ਼ਟੀ ਕਰਨ ਲਈ 1 ਲਿਖੋ ਅਤੇ ਭੇਜੋ.\n\n👉 ਟਾਈਪ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਲਿਖਣ ਲਈ 2 ਭੇਜੋ.",
      },
      noRecord: {
        en_IN:
          "Provided locality is miss-spelled or not present in our system record.\nPlease enter the details again.",
        hi_IN:
          "आपके द्वारा दर्ज किया गया स्थान गलत वर्तनी वाला है या हमारे सिस्टम रिकॉर्ड में मौजूद नहीं है।\nकृपया फिर से विवरण दर्ज करें।",
      },
    },
  },

  // swach file complaint
  swachTrackComplaint: {
    noRecords: {
      en_IN:
        "Sorry 😥 No complaints are found registered from this mobile number.\n\n👉 To go back to the main menu, type and send mseva.",
      hi_IN:
        "अब आपके द्वारा पंजीकृत कोई खुली शिकायत नहीं है।\nमुख्य मेनू पर वापस जाने के लिए ‘mseva’ टाइप करें और भेजें ।",
    },
    results: {
      preamble: {
        en_IN: "Following are your open complaints",
        hi_IN: "आपकी खुली शिकायतें निम्नलिखित हैं",
        pa_IN: "ਤੁਹਾਡੀਆਂ ਖੁੱਲੀਆਂ ਸ਼ਿਕਾਇਤਾਂ ਹੇਠ ਲਿਖੀਆਂ ਹਨ",
      },
      complaintTemplate: {
        en_IN:
          "*{{complaintType}}*\n\nFiled Date: {{filedDate}}\n\nCurrent Complaint Status: *{{complaintStatus}}*\n\nTap on the link below to view details\n{{complaintLink}}",
        hi_IN:
          "*{{complaintType}}*\n\nदायर तिथि: {{filedDate}}\n\nशिकायत की स्थिति: *{{complaintStatus}}*\n\nशिकायत देखने के लिए नीचे दिए गए लिंक पर टैप करें\n{{complaintLink}}",
      },
      closingStatement: {
        en_IN: "👉 To go back to the main menu, type and send mseva.",
        hi_IN: "👉 मुख्य मेनू पर वापस जाने के लिए, टाइप करें और mseva भेजें।",
        pa_IN: "👉 ਮੁੱਖ ਮੀਨੂੰ ਤੇ ਵਾਪਸ ਜਾਣ ਲਈ, ਟਾਈਪ ਕਰੋ ਅਤੇ ਮੇਲ ਭੇਜੋ.",
      },
    },
  },
};

// grammer
let grammer = {
  swachmenu: {
    question: [
      {
        intention: "file_new_swach_complaint",
        recognize: ["1", "swach", "cleaning", "garbage"],
      },
      {
        intention: "track_existing_swach_complaints",
        recognize: ["2", "track swach", "garbage track"],
      },
    ],
  },
  confirmation: {
    choice: [
      { intention: "Yes", recognize: ["1"] },
      { intention: "No", recognize: ["2"] },
    ],
  },
};

module.exports = swach;
