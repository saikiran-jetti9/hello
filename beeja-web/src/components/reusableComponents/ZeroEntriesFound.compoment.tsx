import { ZeroEntriesFoundMainContainer } from '../../styles/ZeroEntriesFoundStyles.Style';
import { NoDocsIcon } from '../../svgs/DocumentTabSvgs.svg';

type ZeroEntriesFound = {
  heading: string;
  message: string;
};
const ZeroEntriesFound = (props: ZeroEntriesFound) => {
  return (
    <ZeroEntriesFoundMainContainer>
      <span>
        <NoDocsIcon />
      </span>
      <span className="contentArea">
        <span className="heading">{props.heading}</span>
        <span className="content">{props.message}</span>
      </span>
    </ZeroEntriesFoundMainContainer>
  );
};

export default ZeroEntriesFound;
