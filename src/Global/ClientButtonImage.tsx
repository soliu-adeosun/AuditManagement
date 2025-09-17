import * as React from 'react';

export interface IClientButtonImageProps {
    func : string;
    clax : string;
    prop : string;
    attr : string;
}

export default class ClientButtonImage extends React.Component<IClientButtonImageProps, {}> {
  public render(): React.ReactElement {
    const pageTemplate : string = 
      `<img src=${require("../../assets/image/search-icon-white.svg")} alt="" class="${this.props.clax}" onclick="${this.props.func}('${this.props.prop}');/>`;
    return (
        <div dangerouslySetInnerHTML={{ __html: pageTemplate }}></div>
    );
  }
}

