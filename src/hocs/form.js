import React, { PureComponent } from "react";

class FormField {
  Validators = [];
  /**
   * @type {FormACC}
   */
  Form;
  Input = null;
  React;
  Field;
  _Errors = [];

  constructor(react, form, field) {
    this.Form = form;
    this.React = react;
    this.Field = field;
  }

  inputModel() {
    return {
      get: () => this.Input,
      set: async value => {
        this.Input = value;
        await this._validate();
        this.React.forceUpdate();
      }
    };
  }

  errorModel() {
    const o = {};
    const errors = this._Errors;
    Object.defineProperties(o, {
      $errors: {
        get: () => errors
      },
      $hasErrors: {
        get: () => errors.length
      }
    });
    return o;
  }

  async _validate() {
    const formData = this.Form.formData();
    let errorMessages = await Promise.all(
      this.Validators.map(validation => validation(this.Input, formData))
    );
    this._Errors = errorMessages.filter(errorMsg => !!errorMsg);
    return this._Errors.length === 0;
  }
}

class FormACC {
  /**
   * @type {Object.<string, FormField>}
   */
  Fields = {};

  /**
   * @param {FormField} field
   */
  pushField(field) {
    if (!this.Fields.hasOwnProperty(field.Field)) {
      this.Fields[field.Field] = field;
    }
  }

  getForm = () => {
    let form = {
      form: {},
      formModels: {}
    };

    for (let key in this.Fields) {
      Object.defineProperty(form.form, key, {
        ...this.Fields[key].inputModel()
      });
      form.formModels[key] = this.Fields[key].errorModel();
    }

    return form;
  };

  formData() {
    return Object.entries(this.Fields).reduce(
      (acc, [k, field]) => ({ ...acc, [k]: field.Input }),
      {}
    );
  }
}

const Form = (
  { form = {}, validations = {} },
  funcz = ({ form }) => ({ form })
) => Component => {
  class Form extends PureComponent {
    /**
     * @type {FormACC}
     */
    formModel;

    constructor(props) {
      super(props);

      this.state = {
        form: Object.entries(form).reduce(
          (a, [key]) => ({ ...a, [key]: null }),
          {}
        )
      };

      this.formModel = new FormACC();
      Object.entries(form).forEach(([key, { defaultValue }]) => {
        let field = new FormField(this, this.formModel, key);
        field.Input = defaultValue;
        field.Validators = validations[key] || [];
        this.formModel.pushField(field);
      });
      // this.formModel.this._updateForm();
    }

    _updateForm() {
      // this.formModel = installGetterSetter.call(
      //   this,
      //   this.state.form,
      //   form,
      //   validations
      // );
    }

    setForm = data => {
      this.setState(
        {
          form: {
            ...this.state.form,
            ...data
          }
        },
        () => {
          this._updateForm();
          this.forceUpdate();
        }
      );
    };

    getForm = () => {
      return this.state.form;
    };

    render() {
      return (
        <Component
          {...funcz({
            ...this.formModel.getForm(),
            // setForm: this.setForm,
            getForm: this.formModel.formData()
          })}
          {...this.props}
        />
      );
    }
  }
  Form.displayName = `Form(${getDisplayName(Component)})`;

  return Form;
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export default Form;
