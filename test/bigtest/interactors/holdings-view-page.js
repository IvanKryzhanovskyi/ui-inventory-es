import {
  interactor,
  clickable,
  isPresent,
  isVisible,
  text
} from '@bigtest/interactor';

@interactor class HeaderDropdown {
  click = clickable('button');
}

@interactor class HeaderDropdownMenu {
  clickEdit = clickable('#edit-holdings');
  clickDuplicate = clickable('#copy-holdings');
  hasDeleteHoldingsRecord = isPresent('[data-test-inventory-delete-holdingsrecord-action]');
  clickDelete = clickable('[data-test-inventory-delete-holdingsrecord-action]');
}

@interactor class HoldingsViewPage {
  title = text('[data-test-header-title]');
  headerDropdown = new HeaderDropdown('[class*=paneHeaderCenterInner---] [class*=dropdown---]');
  headerDropdownMenu = new HeaderDropdownMenu();
  confirmDeleteModalIsVisible = isVisible('#data-test-delete-confirmation-modal');
  noDeleteHoldingsRecordModalIsVisible = isVisible('[data-test-no-delete-holdingsrecord-modal]');

  confirmDeleteModalIsPresent = isPresent('#data-test-delete-confirmation-modal');
  noDeleteHoldingsRecordModalIsPresent = isPresent('[data-test-no-delete-holdingsrecord-modal]');
}

export default new HoldingsViewPage();
