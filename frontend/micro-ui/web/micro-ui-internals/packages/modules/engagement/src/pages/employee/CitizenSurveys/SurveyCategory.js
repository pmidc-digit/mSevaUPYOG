
import React,{ Fragment, useEffect, useState }  from 'react';
import { Card,CardText,CardHeader, TextInput,Header,ActionBar,SubmitBar} from "@mseva/digit-ui-react-components";
import { useForm, Controller,FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
const SurveyCategory = () => {
    const { t } = useTranslation();
    const tenantId = Digit.ULBService.getCurrentTenantId();
  const { register:registerRef, control, handleSubmit, setValue, getValues, reset, formState ,clearErrors,...methods} = useForm({
    defaultValues: {
       categoryName:""
    }
})
 
const stylesForForm = {
  marginLeft:'-20px',
}
const onSubmit = (data) => {
  const { categoryName } = data;
  console.log(data);
  // registerRef("categoryName");
  setValue("categoryName",data.categoryName)
  const details = {
    Categories:[ {
      tenantId: tenantId,
      label:data.categoryName
    }
  ]
  };
  
  try{
   
    Digit.Surveys.createCategory(details).then((response) => {
      if(response?.Categories?.length>0)
      {
        setShowToast({ key: true, label: "Category sucessfully created" });
      }
      else
      {
        setShowToast({ key: true, label: `${response?.Errors?.message}` });
      }
    })
  }
  catch(error)
  {
    console.log(error);
  }
  

  
}
  // useEffect(() => {
  //   registerRef("categoryName");
  // }, []);
  return (
   <Fragment>
<Header>
  Survey Category
  <div style={stylesForForm}>
    </div>
</Header>

{/* <div className="survey-grid-container ">
  <div>
  <label>Category</label>
  <TextInput name="Category" inputRef={register({})}/>
  </div>
  <button style={{backgroundColor:"#092e86",borderRadius: "8px",color:'white',gap: "18px",height:'50px',marginTop:'7%'}}>Submit</button>
</div> */}

  <div style={{margin:"8px"}}>
      <FormProvider {...{
        register: registerRef,
       
        handleSubmit,
        setValue,
        getValues,
        reset,
        formState,
        clearErrors,
        ...methods
      }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
          <div className="surveydetailsform-wrapper">
      <span className="surveyformfield">
        <label>{`${t("Category Name")} * `}</label>
         <TextInput
                  name="categoryName"
                  type="text"
                  inputRef={registerRef({
                    required: t("ES_ERROR_REQUIRED"),
                    maxLength: {
                      value: 60,
                      message: t("EXCEEDS_60_CHAR_LIMIT"),
                    },
                
                  })}
                 
                />
                  </span>
                  </div>
          </Card>
          <ActionBar>
            <SubmitBar label={t("Create Category")} submit="submit" />
          </ActionBar>
        </form>
      </FormProvider>
    </div>

</Fragment>

  )
}

export default SurveyCategory;