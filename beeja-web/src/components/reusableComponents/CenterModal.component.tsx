import { useTranslation } from 'react-i18next';
import {
  CenterModalContainer,
  CenterModelMainContainer,
  EditProfileText,
  CloseButton,
  DashedBox,
  DashedBoxContent,
  DropText,
  MonogramArea,
} from '../../styles/CenterModalStyles.style';
import { LogoutModalSVG } from '../../svgs/CommonSvgs.svs';
import { CloseButtonSVG } from '../../svgs/profilePictureSvgs.svg';
import { CloudIconSVG } from '../../svgs/profilePictureSvgs.svg';

type CenterModalProps = {
  handleModalClose: () => void;
  handleModalSubmit: () => void;
  handleModalLeftButtonClick?: () => void;
  modalHeading?: string;
  modalContent?: React.ReactNode;
  modalSVG?: React.ReactNode;
  modalLeftButtonText?: string;
  modalRightButtonText?: string;
  modalType?: string;
  modalLeftButtonClass?: string;
  modalRightButtonClass?: string;
  modalWidth?: string;
  modalRightButtonBorderColor?: string;
  modalRightButtonTextColor?: string;
  isResponseLoading?: boolean;
  isMonogramView?: boolean;
  isImageSelected?: boolean;
  compactButtonStyle?: boolean;
  isDashedBox?: boolean;
  isExpanded?: boolean;
  editText?: string;
  dragText?: string;
};

const CenterModal = (props: CenterModalProps) => {
  const { t } = useTranslation();
  const rightButtonStyles = props.modalRightButtonClass
    ? {
        backgroundColor: 'white',
        border: `2px solid ${props.modalRightButtonBorderColor || 'red'}`,
        color: `${props.modalRightButtonBorderColor || 'red'}`,
      }
    : {};

  const buttonContainerClass = props.compactButtonStyle
    ? 'compactButtonContainer'
    : '';

  return (
    <CenterModalContainer>
      <CenterModelMainContainer
        className={`${props.modalType} ${props.isMonogramView ? 'modal-monogram' : ''} ${props.isImageSelected ? 'imageSelected' : ''} ${props.isDashedBox ? 'dashedBox' : ''}`}
        Width={props.modalWidth}
        isExpanded={props.isExpanded}
      >
        {(props.isMonogramView ||
          props.isImageSelected ||
          props.isDashedBox) && (
          <>
            <EditProfileText>{props.editText}</EditProfileText>

            <CloseButton onClick={props.handleModalClose}>
              <CloseButtonSVG />
            </CloseButton>
          </>
        )}
        {!props.isMonogramView &&
          !props.modalContent &&
          !props.isImageSelected && (
            <div className="iconArea">
              {props.modalSVG ? props.modalSVG : <LogoutModalSVG />}
            </div>
          )}
        {props.isDashedBox && (
          <DashedBox onClick={props.handleModalLeftButtonClick}>
            <DashedBoxContent>
              <CloudIconSVG />
              <DropText>{props.dragText}</DropText>
            </DashedBoxContent>
          </DashedBox>
        )}
        {props.isMonogramView ? (
          <MonogramArea>{props.modalContent}</MonogramArea>
        ) : (
          <div>
            {props.isImageSelected ? (
              <div>{props.modalContent}</div>
            ) : (
              <>
                <div className="modalHeading">{props.modalHeading}</div>
                <div className="modalContent">{props.modalContent}</div>
              </>
            )}
          </div>
        )}

        {/* Modal Control Buttons */}
        <div className={`controlButtonArea ${buttonContainerClass}`}>
          <button
            className={props.modalLeftButtonClass || 'closeButton'}
            onClick={props.handleModalLeftButtonClick}
          >
            {props.modalLeftButtonText || 'No'}
          </button>
          <button
            disabled={props.isResponseLoading}
            className={
              props.isResponseLoading ? 'loading' : props.modalRightButtonClass
            }
            style={rightButtonStyles}
            onClick={props.handleModalSubmit}
          >
            {props.modalRightButtonText ||
              (props.isResponseLoading ? '' : 'Yes')}
          </button>
        </div>
      </CenterModelMainContainer>
    </CenterModalContainer>
  );
};

export default CenterModal;
