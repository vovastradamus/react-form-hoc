import React, { PureComponent } from "react";
import { wrap } from "lodash/function";

class Field {
  /**
   * @type {Boolean}
   */
  Touched = false;
  Value = null;
  /**
   * @type {CallableFunction[]}
   */
  Validations = [];
  /**
   * @private
   * @type {String[]}
   */
  _Errors = [];
  /**
   * @type {Form}
   */
  Form = null;

  constructor(value = null, form) {
    this.Value = value;
    this.Form = form;
  }

  get GettersSetters() {
    return {
      get: () => this.Value,
      set: async value => {
        this.Touched = true;
        this.Value = value;
        await this._validate();
      }
    };
  }

  unsetTouch() {
    this.Touched = false;
  }

  get FieldModels() {
    let o = {};

    Object.defineProperties(o, {
      $errors: {
        get: () => (this.Touched ? this._Errors : [])
      },
      $hasErrors: {
        get: () => (this.Touched ? !!this._Errors.length : false)
      },
      $touched: {
        get: () => this.Touched
      }
    });

    return o;
  }

  async _validate() {
    const formData = this.Form.formData();
    let errorMessages = await Promise.all(
      this.Validations.map(validation => validation(this.Value, formData))
    );
    this._Errors = errorMessages.filter(errorMsg => !!errorMsg);
  }
}

class Form {
  /**
   * @type {Object.<string, Field>}
   */
  Fields = {};
  FormFields = {
    form: {},
    formModels: {}
  };
  /**
   * @type {PureComponent}
   */
  ReactComponent = null;

  constructor(reactInstance) {
    this.ReactComponent = reactInstance;
  }

  /**
   *
   * @param {string} name
   * @param {Field} field
   */
  addField(name, field) {
    const self = this;
    this.Fields[name] = field;

    let getset = field.GettersSetters;
    getset.set = wrap(getset.set, async function(f, value) {
      await f(value);
      self.ReactComponent.forceUpdate();
    });

    Object.defineProperty(this.FormFields.form, name, getset);
    this.FormFields.formModels[name] = field.FieldModels;
  }

  /**
   * assign data to form
   */
  setData = data => {
    for (const key in data) {
      if (this.Fields.hasOwnProperty(key)) {
        this.FormFields.form[key] = data[key];
      }
    }
  };

  untouchForm = () => {
      for (const key in this.Fields) {
        this.Fields[key].unsetTouch();
      }
      this.ReactComponent.forceUpdate();
  }

  touchForm = async () => {
    for (const key in this.Fields) {
        this.FormFields.form[key] = this.FormFields.form[key];
    }
  }

  formData() {
    return Object.entries(this.Fields).reduce(
      (acc, [k, { Value }]) => ({ ...acc, [k]: Value }),
      {}
    );
  }
}

export const connectForm = (
  { form = {}, validations = {} },
  formToProps = ({ form }) => ({ form })
) => Component => {
  class FormHOC extends PureComponent {
    /**
     * @type {Form}
     */
    Form;

    constructor(props) {
      super(props);

      this.Form = new Form(this);

      Object.entries(form).forEach(([key, { defaultValue }]) => {
        let field = new Field(defaultValue, this.Form);
        field.Validations = validations[key] || [];
        this.Form.addField(key, field);
      });
    }

    render() {
      return (
        <Component
          {...formToProps({
            form: this.Form.FormFields.form,
            formModels: this.Form.FormFields.formModels,
            formActions: {
              formData: this.Form.formData,
              setFormData: this.Form.setData,
              untouchForm: this.Form.untouchForm,
              touchForm: this.Form.touchForm,
            }
          })}
          {...this.props}
        />
      );
    }
  }
  FormHOC.displayName = `FormHOC(${getDisplayName(Component)})`;

  return FormHOC;
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}
