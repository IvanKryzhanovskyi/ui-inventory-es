import {
  AFTER,
  BEFORE,
  CLOSE_BRACKET,
  OPEN_BRACKET,
  SPACE
} from './constants';

export const getSearchOption = (val, notEditableValueBefore, notEditableValueAfter) => {
  return val
    .replace(notEditableValueBefore, '')
    .replace(notEditableValueAfter, '')
    .replace(/^\(/, '')
    .replace(/^"|"$/g, '');
};

export const setCaretPosition = (textareaRef, caretPos) => {
  textareaRef.current?.setSelectionRange(caretPos, caretPos);
};

const isValueToInsertAlreadyQuoted = (valueToInsert) => {
  const val = valueToInsert.replace(/[()]/g, '');
  return val.startsWith('"') && val.endsWith('"');
};

const isAllQuotesExist = (val) => {
  let quotes = '';

  for (let i = 0; i < val.length; i++) {
    const char = val[i];
    if (char === '"') {
      quotes += char;
    }
  }
  return !(quotes.length % 2);
};

const processValueWithSpace = (valueToInsert) => {
  if (isValueToInsertAlreadyQuoted(valueToInsert)) {
    return valueToInsert;
  }

  const valueWithoutQuotesAndBracketsAround = valueToInsert.replace(/^\(|\)$/g, '').replace(/^"|"$/g, '');

  if (valueToInsert.startsWith(OPEN_BRACKET) && !valueToInsert.includes(CLOSE_BRACKET)) {
    return `${OPEN_BRACKET}"${valueWithoutQuotesAndBracketsAround}"`;
  }
  if (valueToInsert.endsWith(CLOSE_BRACKET) && !valueToInsert.includes(OPEN_BRACKET)) {
    return `"${valueWithoutQuotesAndBracketsAround}"${CLOSE_BRACKET}`;
  }
  if (valueToInsert.startsWith(OPEN_BRACKET)) {
    return `${OPEN_BRACKET}"${valueToInsert.slice(1)}"`;
  }
  if (
    valueToInsert.startsWith('"') &&
    !valueToInsert.trim().endsWith('"') &&
    isAllQuotesExist(valueToInsert)
  ) {
    return valueToInsert;
  }
  return `"${valueToInsert}"`;
};

export const findBoolOperator = (booleanOperators, val, i, flag) => {
  let twoCharacterBoolOperWithSpace;
  let threeCharacterBoolOperWithSpace;

  if (flag === BEFORE) {
    twoCharacterBoolOperWithSpace = val.slice(i - 3, i);
    threeCharacterBoolOperWithSpace = val.slice(i - 4, i);
  } else {
    twoCharacterBoolOperWithSpace = val.slice(i + 1, i + 4);
    threeCharacterBoolOperWithSpace = val.slice(i + 1, i + 5);
  }

  const booleanOperator = booleanOperators.find(boolOper => (
    boolOper.label.toLowerCase() === twoCharacterBoolOperWithSpace.toLowerCase().trim() ||
    boolOper.label.toLowerCase() === threeCharacterBoolOperWithSpace.toLowerCase().trim()
  ));
  return booleanOperator || {};
};

const addQuotesIfNeeded = (val) => {
  if (!val.includes(SPACE)) {
    return val;
  }
  const isValueQuoted = val.startsWith('"') && val.endsWith('"');
  return isValueQuoted ? val : `"${val}"`;
};

const addQuotesToTermItems = (valueToInsert, booleanOperators) => {
  const valueWithoutBrackets = valueToInsert.replace(/^\(|\)$/g, '');
  const spaceLength = 1;
  let quotedTermItems = '';
  let termItem = '';
  let continueCount = 0;

  for (let i = 0; i < valueWithoutBrackets.length; i++) {
    const char = valueWithoutBrackets[i];
    if (continueCount) {
      continueCount--;
      // eslint-disable-next-line
      continue;
    }

    if (char === SPACE) {
      const { label: boolOperator } = findBoolOperator(booleanOperators, valueWithoutBrackets, i, AFTER);

      if (boolOperator) {
        quotedTermItems += quotedTermItems
          ? `${SPACE}${addQuotesIfNeeded(termItem)}${SPACE}${boolOperator}`
          : `${addQuotesIfNeeded(termItem)}${SPACE}${boolOperator}`;

        termItem = '';
        continueCount = boolOperator.length + spaceLength;
      } else {
        termItem += char;
      }
    } else {
      termItem += char;
    }
  }
  quotedTermItems += `${SPACE}${addQuotesIfNeeded(termItem)}`;
  return `${OPEN_BRACKET}${quotedTermItems}${CLOSE_BRACKET}`;
};

const isEvenNumberOfBrackets = (val) => {
  let brackets = '';

  for (let i = 0; i < val.length; i++) {
    const char = val[i];
    if (char === OPEN_BRACKET || char === CLOSE_BRACKET) {
      brackets += char;
    }
  }

  return !(brackets.length % 2);
};

export const addQuotes = (valueToInsert, booleanOperators) => {
  if (
    valueToInsert.startsWith(OPEN_BRACKET) &&
    valueToInsert.endsWith(CLOSE_BRACKET) &&
    isEvenNumberOfBrackets(valueToInsert)
  ) {
    return addQuotesToTermItems(valueToInsert, booleanOperators);
  }
  if (valueToInsert.includes(SPACE)) {
    return processValueWithSpace(valueToInsert);
  }
  if (valueToInsert.startsWith(OPEN_BRACKET)) {
    return `${OPEN_BRACKET}${valueToInsert.slice(1)}`;
  }
  if (valueToInsert.endsWith(CLOSE_BRACKET)) {
    return `${valueToInsert.slice(0, -1)}${CLOSE_BRACKET}`;
  }
  return valueToInsert;
};

export const isValueFromOptions = (val, options) => {
  return options.some(option => {
    return option.label.toLowerCase() === val.trim().toLowerCase();
  });
};

export const isSomeOptionIncludesValue = (val, options) => {
  return options.some(option => {
    return option.label.toLowerCase()
      .includes(val.toLowerCase());
  });
};

export const moveScrollToDown = (optionsContainerRef, optionRef, isLastOption) => {
  const optionsContainerElement = optionsContainerRef.current;
  const optionElement = optionRef.current;

  if (isLastOption) {
    optionsContainerElement.scrollTop = 0;
  } else if (optionElement) {
    const optionPosition = optionElement.offsetTop + optionElement.offsetHeight;
    const optionsContainerPosition =
      optionsContainerElement.clientHeight +
      optionsContainerElement.scrollTop -
      optionElement.offsetHeight;

    // Measured the option position with the option height
    // changed the scroll top if the option reached the end of the options container height
    if (optionPosition >= optionsContainerPosition) {
      optionsContainerElement.scrollTop += optionElement.offsetHeight;
    }
  }
};

export const moveScrollToTop = (optionsContainerRef, optionRef, isFirstOption) => {
  const optionsContainerElement = optionsContainerRef.current;
  const optionElement = optionRef.current;

  if (isFirstOption) {
    if (optionsContainerElement) {
      optionsContainerElement.scrollTop = optionsContainerElement.scrollHeight;
    }
  } else if (optionElement && optionsContainerElement) {
    const optionPosition = optionElement.offsetTop - optionElement.offsetHeight;
    if (optionPosition <= optionsContainerElement.scrollTop) {
      optionsContainerElement.scrollTop -= optionElement.offsetHeight;
    }
  }
};

export const getValueToHighlight = (operators, booleanOperators, typedValueWithoutOpenBracket) => {
  const isOperator = operators.some(oper => oper.label === typedValueWithoutOpenBracket.trim());
  const isBoolOperator = booleanOperators.some(boolOper => boolOper.label === typedValueWithoutOpenBracket.trim());
  return isOperator || isBoolOperator
    ? typedValueWithoutOpenBracket.trim()
    : typedValueWithoutOpenBracket;
};

export const getNotEditableSearchOptionLeftSide = (selectionStartNumber, curValue, booleanOperators) => {
  const leftValue = curValue.slice(0, selectionStartNumber);

  for (let i = selectionStartNumber - 1; i > 0; i--) {
    const char = leftValue[i];

    if (char === SPACE) {
      const { label: boolOperatorBefore } = findBoolOperator(booleanOperators, curValue, i, BEFORE);
      if (boolOperatorBefore) {
        return curValue.slice(0, i + 1);
      }
    }
  }

  return '';
};

export const getNotEditableSearchOptionRightSide = (selectionStartNumber, curValue, operators) => {
  for (let i = selectionStartNumber; i < curValue.length; i++) {
    const char = curValue[i];
    const operatorWithSpaceAfter = curValue.slice(i, i + 3);
    const isOperatorAfter = operators.some(oper => oper.label === operatorWithSpaceAfter.trim());

    if (char === SPACE && isOperatorAfter) {
      return curValue.slice(i);
    }
  }

  return '';
};

export const getNotEditableValueBefore = (
  selectionStartNumber,
  curValue,
  operators,
  booleanOperators,
  typedValueForEditMode,
) => {
  const leftValue = curValue.slice(0, selectionStartNumber);

  for (let i = selectionStartNumber - 1; i > 0; i--) {
    const char = leftValue[i];
    const charAfter = leftValue[i + 1];

    if (char === CLOSE_BRACKET && charAfter === SPACE) {
      return curValue.slice(0, i + 1);
    }

    if (char === SPACE) {
      const operatorWithSpaceBefore = leftValue.slice(i - 2, i);
      const isOperatorBefore = operators.some(oper => oper.label === operatorWithSpaceBefore.trim());

      const { label: boolOperatorBefore } = findBoolOperator(booleanOperators, curValue, i, BEFORE);
      if (boolOperatorBefore) {
        return curValue.slice(0, i + 1);
      }

      const { label: boolOperatorAfter } = findBoolOperator(booleanOperators, curValue, i, AFTER);
      if (boolOperatorAfter || isOperatorBefore) {
        return curValue.slice(0, i + 1);
      }
    }

    const { label: boolOperatorAfter } = findBoolOperator(booleanOperators, curValue, i + 1, AFTER);
    if (boolOperatorAfter && !typedValueForEditMode) {
      return curValue.slice(0, i + 1);
    }

    const { label: boolOperatorBefore } = findBoolOperator(booleanOperators, curValue, i + 1, BEFORE);
    if (boolOperatorBefore) {
      return curValue.slice(0, i + 1);
    }
  }

  return '';
};

export const getNotEditableValueAfter = (selectionStartNumber, curValue, booleanOperators) => {
  for (let i = selectionStartNumber; i < curValue.length; i++) {
    const char = curValue[i];

    if (char === SPACE) {
      const { label: boolOperatorBefore } = findBoolOperator(booleanOperators, curValue, i, BEFORE);
      if (boolOperatorBefore) return curValue.slice(i);

      const { label: boolOperatorAfter } = findBoolOperator(booleanOperators, curValue, i, AFTER);
      if (boolOperatorAfter) return curValue.slice(i);

      const isLineEndAfter = !curValue[i + 1];
      if (isLineEndAfter) return '';
    }

    const { label: boolOperatorAfter } = findBoolOperator(booleanOperators, curValue, i - 1, AFTER);
    if (boolOperatorAfter) return curValue.slice(i);

    const { label: boolOperatorBefore } = findBoolOperator(booleanOperators, curValue, i - 1, BEFORE);
    if (boolOperatorBefore) return curValue.slice(i);
  }

  return '';
};

export const getSearchWords = (
  isTypedValueNotBracket,
  typedValue,
  typedValueWithoutOpenBracket,
  operators,
  booleanOperators
) => {
  const isValidSearchWords =
    isTypedValueNotBracket
    && typedValue !== SPACE
    && typedValueWithoutOpenBracket;
  return isValidSearchWords
    ? [getValueToHighlight(operators, booleanOperators, typedValueWithoutOpenBracket)]
    : [];
};

export const changeTextAreaHeight = (textareaRef) => {
  textareaRef.current.focus();
  textareaRef.current.style.height = 0;
  const scrollHeight = textareaRef.current.scrollHeight;
  textareaRef.current.style.height = `${scrollHeight}px`;
};
