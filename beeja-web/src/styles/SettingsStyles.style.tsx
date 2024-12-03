import styled from 'styled-components';
export const SettingsMainContainer = styled.section`
  padding: 30px;
`;
export const SettingHeadSection = styled.div`
  width: fit-content;
  font-weight: 700;
  font-size: 24px;
  gap: 20px;
  span {
    font-weight: 500;
    height: 22px;
    font-size: 14px;
    color: #687588;
  }
`;
export const SectionsContainer = styled.div`
  display: flex;
  gap: 25px;
  margin-top: 20px;
  margin-left: 0;
  @media screen and (max-width: 1100px) {
    flex-direction: column;
  }
`;
export const NavbarSection = styled.section`
  display: flex;
  min-width: 300px;
  height: fit-content;
  padding: 24px;
  color: ${(props) => props.theme.colors.blackColors.black1};
  background-color: ${(props) => props.theme.colors.backgroundColors.primary};
  border-radius: 16px;
  @media screen and (max-width: 1100px) {
    padding: 5px 10px 10px 5px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  }
  position: sticky;
  top: 100px;
  z-index: 2;
`;
export const NavList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  li {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    width: 252px;
    font-size: 14px;
    font-weight: 700;
    list-style: none;
    margin-bottom: 10px;
    padding: 16px 10px 16px 10px;
    cursor: pointer;
  }
  li.active {
    background-color: ${(props) => props.theme.colors.blackColors.white4};
    border-radius: 10px;
    color: ${(props) => props.theme.colors.brandColors.primary};
  }
  svg {
    margin-right: 10px;
    align-self: flex-start;
  }
  @media screen and (max-width: 1100px) {
    overflow-x: scroll;
    ul {
      display: flex;
    }

    li {
      height: fit-content;
      justify-content: center;
      min-width: fit-content;
      width: 190px;
      margin-bottom: 0px;
    }
  }
`;
export const SelectedTabSection = styled.section`
  width: 60%;
  left: 348px;
  height: fit-content;
  right: 16px;
  padding: 15px;
  gap: 24px;
  background-color: ${(props) => props.theme.colors.backgroundColors.primary};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  @media screen and (max-width: 1100px) {
    width: 100%;
    margin-top: 20px;
    margin-left: 0;
    margin-right: auto;
    left: 0;
    right: auto;
  }
`;
