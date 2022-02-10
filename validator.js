
function Validator(options) {


    // tim the cha la selector
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            } 
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // Ham thuc hien validate
    function Validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;

        // Lay ra cac rule cua selector
        var rules = selectorRules[rule.selector];

        // Lap qua tung rule & kiem tra
        // Neu co loi thi dung viec kiem
        for(var i=0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            if(errorMessage) break;
        }

        if(errorMessage) {

            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');

        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');

        }

        return !errorMessage;
    }

    // Lay form can validate
    var formElement = document.querySelector(options.form)

    if (formElement) {

        // Xu li su kien form submit
        formElement.onsubmit = function(e) {

            e.preventDefault();

            // isFormValid = true neu co loi/ nguoc lai
            var isFormValid = true;

            options.rules.forEach(function (rule) {

                var inputElement = formElement.querySelector(rule.selector);
                
                var isValid = Validate(inputElement, rule);
                if(!isValid) {
                    isFormValid = false;
                }
            });

            // Neu form nhap dung
            if(isFormValid) {

                if(typeof options.onSubmit === 'function') {
                    // Lay ra cac iput co attribute = name va khong co disabled
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    
                    //=> queryseclectorall tra ve 1 NodeList, nó không các các phương thức của mảng như: reduce, map, ... nên phải chuyển về mảng bằng cách như sau
                    var formValues = Array.from(enableInputs).reduce(function(values,input) {
                        (values[input.name] = input.value)
                        return values;
                    }, {})

                    options.onSubmit(formValues);

                }

            }

        }


        // Duyet qua cac rules va xu li
        options.rules.forEach(function (rule) {

            
            // Luu lai cac rule cua selector 
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            // Lay input tu cac rules
            var inputElement = formElement.querySelector(rule.selector);
            
            if(inputElement) {

                // Khi blur ra ngoai thi goi ham validate
                inputElement.onblur = function() {
                    Validate(inputElement, rule);
                }


                // Xu li moi khi nguoi dung go, se mat cai khung mau do
                inputElement.oninput = function () {
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector)

                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
        })

    }
}


// Dinh nghia ra cac rules
// Truong nay la bat buoc
Validator.isRequired = function (selector) {
    return {
        selector,
        test: function (value) {
            // Khi nhap dung thi return undefine 
            // Khi nhap sai thi hien ra message loi
            return value.trim() ? undefined : 'Please entering!';
        }
    }
}

// Truong nay phai la email
Validator.isEmail = function (selector) {
    return {
        selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Truong nay phai la email';
        }
    }
}

Validator.minLength = function (selector, min) {
    return {
        selector,
        test: function (value) {
            return value.length >= min ? undefined : `Vui long nhap toi thieu ${min} ki tu`;
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message='Gia tri nhap vao khong chinh xac') {
    return {
        selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message;
        }
    }
}