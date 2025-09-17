var PeoplePicker = new PeoplePickerComponentConstructor();
function PeoplePickerComponentConstructor () {
  this.pickerEventDefinitions = null;
  this.defaultValues = {};
}

PeoplePicker.setDefault = function (pickerId, email) {
  if (!pickerId || !email) return;
  PeoplePicker.defaultValues[pickerId] = email;
};

PeoplePicker.initializePeoplePickers = function (peopleListMap, pickerEvents, attr = "custom-people") {
  PeoplePicker.pickerEventDefinitions = null;
  const pickers = document.querySelectorAll(`[${attr}]`);

  pickers.forEach(picker => {
    const pickerId = picker.getAttribute(attr);
    let peopleList;
    if(Array.isArray(peopleListMap)){
      peopleList = peopleListMap;
    }
    else{
      peopleList = peopleListMap?.[pickerId];
      if (!Array.isArray(peopleList)) return;
    }
    
    const $picker = $(picker);
    $picker.empty().append('<option></option>');

    peopleList.forEach(person => {
      //const option = new Option(person.Title, person.Email, false, false);
      var str = `<option value="${person.Email}" data-image="${MainApplication.profilephoto}${person.Email}">${person.Title}</option>`;
      $picker.append(str);
    });

    const placeholderText = $picker.attr("placeholder") || "Enter a name";
    const modalParent = $picker.closest('.modal');
    var options = {
      placeholder: placeholderText,
      allowClear: true,
      minimumInputLength: 3,
      templateResult: formatOption,
      templateSelection: formatOption,
      matcher: function (params, data) {
        // If there's no search term, return all data
        if ($.trim(params.term) === '') {
          return data;
        }
    
        // Normalize and lowercase for comparison
        const term = params.term.toLowerCase();
    
        // Search by visible text (Title)
        if (data.text && data.text.toLowerCase().includes(term)) {
          return data;
        }
    
        // Search by email (value is in data.id)
        if (data.id && data.id.toLowerCase().includes(term)) {
          return data;
        }
    
        // Not matched
        return null;
      },
      ...(modalParent.length && { dropdownParent: modalParent })
    };

    $picker.select2(options);

    if(typeof pickerEvents !== "undefined"){
      PeoplePicker.pickerEventDefinitions = pickerEvents;
      $(picker).on('select2:select', function (e) {
        var selectedValue = e.params.data.id;
        var prop = e.target.getAttribute("custom-people");
        if(typeof PeoplePicker.pickerEventDefinitions[prop] == "function"){
          PeoplePicker.pickerEventDefinitions[prop](selectedValue);
        }

        var selectionOrder = e.target.getAttribute("disable-selection-order");
        selectionOrder = (selectionOrder == "true") ? true : false;
        if($(e.target).prop("multiple") && selectionOrder){
          var element = e.params.data.element; // Get the selected option
          var $element = $(element);

          // Detach the option and append it to the end of the select
          $element.detach();
          $(this).append($element);

          // Trigger change to update Select2
          $(this).trigger('change');
        }
      });
    }
      // Set the value if it exists in the default values
    const defaultVal = PeoplePicker.defaultValues?.[pickerId];
    if (defaultVal) {
      let selectid = picker.getAttribute("id");
      let selectionOrder = picker.getAttribute("disable-selection-order");
      selectionOrder = (selectionOrder == "true") ? true : false;
      if($picker.prop("multiple") && selectionOrder){
        defaultVal.forEach(function(item) {
            var option = $('select#'+ selectid +' option[value="' + item + '"]');
            option.detach();
            $('select#'+ selectid).append(option);
        });
        $picker.val(defaultVal).trigger('change');
      }
      else{
        $picker.val(defaultVal).trigger("change");
      }
    }

    function formatOption(option) {
      if (!option.id) return option.text; // Skip placeholder or no selection
      var imageUrl = $(option.element).data('image');
      return $(
        `<span><img src="${imageUrl}" class="custom-picker-li-image"> ${option.text}</span>`
      );
    }
  });
};

PeoplePicker.getValue = function (customAttr = "custom-people") {
  const pickers = document.querySelectorAll(`[${customAttr}]`);
  let results = {};

  pickers.forEach(picker => {
      const pickerId = picker.getAttribute(customAttr);
      const valueType = picker.getAttribute("control-value-type");
      const $picker = $(picker);
      const selected = $picker.val();

      if ($picker.prop("multiple")) {
          if (!Array.isArray(selected)) return;

          for(var x = 0; x < selected.length; x++){
            if (valueType === "people") {
              results[pickerId] = results[pickerId] || [];
              results[pickerId].push(SP.FieldUserValue.fromUser(selected[x]));
            } else {
              results[pickerId] = results[pickerId] || [];
              results[pickerId].push(selected[x]);
            }
          }
      } else {
        results[pickerId] = (valueType === "people") ? SP.FieldUserValue.fromUser(selected) : selected;
      }
  });

  return results;
};

PeoplePicker.getConfiguredValue = function (customAttr = "custom-people") {
  const pickers = document.querySelectorAll(`[${customAttr}]`);
  let results = {};

  pickers.forEach(picker => {
      const pickerId = picker.getAttribute(customAttr);
      const $picker = $(picker);
      const selected = $picker.val();

      if ($picker.prop("multiple")) {
          if (!Array.isArray(selected)) return;

          for(var x = 0; x < selected.length; x++){
            results[pickerId] = results[pickerId] || [];
            results[pickerId].push(selected[x]);
          }
      } else {
        results[pickerId] = selected;
      }
  });

  return results;
};

PeoplePicker.getTitle = function (customAttr = "custom-people") {
  const pickers = document.querySelectorAll(`[${customAttr}]`);
  let results = {};

  pickers.forEach(picker => {
    const pickerId = picker.getAttribute(customAttr);
    const $picker = $(picker);
    const selected = $picker.val();

    if ($picker.prop("multiple")) {
      if (!Array.isArray(selected)) return;

      results[pickerId] = selected.map(val => {
        const option = $picker.find(`option[value="${val}"]`);
        return option.text();
      });
    } else {
      const option = $picker.find(`option[value="${selected}"]`);
      results[pickerId] = option.text();
    }
  });

  return results;
};

PeoplePicker.disablePicker = function (pickerId) {
  const $picker = $(`[custom-people="${pickerId}"]`);
  if (!$picker.length) return;

  $($picker).prop('disabled', true);
};

PeoplePicker.reset = function (pickerId) {
  const $picker = $(`[custom-people="${pickerId}"]`);
  if (!$picker.length) return;

  const isMultiple = $picker.prop("multiple");
  $picker.val(isMultiple ? [] : null).trigger("change");
};

PeoplePicker.resetAll = function (attr = "custom-people") {
  const pickers = document.querySelectorAll(`[${attr}]`);
  pickers.forEach(picker => {
    const $picker = $(picker);
    const isMultiple = $picker.prop("multiple");
    $picker.val(isMultiple ? [] : null).trigger("change");
  });
};
