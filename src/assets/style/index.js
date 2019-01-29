import {
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';

const { height, width } = Dimensions.get('window');

export const StyleConfig = {

  colorPrimary: 'rgba(60, 177, 158, 1)',
  colorDanger: 'rgba(199, 85, 74, 1)',
  colorWarning: 'rgba(216, 196, 128, 1)',
  colorSuccess: 'rgba(69, 190, 174, 1)',
  colorWhite: 'rgba(255, 255, 255, 1)',
  colorLight: 'rgba(255, 255, 255, 0.6)',
  colorMuted: 'rgba(0, 0, 0, 0.4)',
  colorGray: 'rgba(0, 0, 0, 0.6)',
  colorDark: 'rgba(0, 0, 0, 0.7)',
  colorBlack: 'rgba(0, 0, 0, 0.8)',
  colorTransparent: "transparent",
    headerBgColor : '#DF2214',

  fontEg: 24,
  fontLg: 20,
  fontMd: 18,
  fontSm: 16,
  fontXs: 14,
  fontMs: 12,

  lineHeightLg: 36,
  lineHeightMd: 26,
  lineHeightSm: 24,

  space0:   0,
  space1:   5,
  space2:   10,
  space3:   15,
  space4:   20
};

export const memberFormStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inputFile: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#FFF',
        height: 40,
        marginTop: 10,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginHorizontal: 10,
    },
    inputIcon: {
        flex: 1,
    },
    inputText: {
        flex: 1,
        marginHorizontal: 10,
        fontSize: 14
    },
    messCaptcha: {
        paddingLeft: 10,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderColor: '#C9C9C9'
    },
    textBtn: {
        fontSize: 14,
        color: '#00FFFF'
    },
    appBtn: {
        marginHorizontal: 10,
        marginTop: 10,
    }
});

export const memberBankCard = StyleSheet.create({
    container: {
        padding: 10,
    },
    cardList: {
        flexDirection: 'row',
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#FFF',
        justifyContent:'flex-start',
        alignItems: 'center',
        borderRadius: 5,
    },
    bankIcon: {
        width: 40,
        height: 40,
        marginRight: 10
    },
    bank: {
        fontSize: 16,
        color: '#373737',
        paddingVertical: 5
    },
    text: {
        fontSize: 14,
        color: '#757575',
        paddingVertical: 5
    }
});

export const listStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
        backgroundColor: '#FBE4E3',
        zIndex: 1,
        borderBottomColor:'#E9C4C0',
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    tableCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerTextColor: {
        color: '#721105'
    },
    tableRow: {
        backgroundColor: '#FFF',
        height: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#F7F7F7'
    }
});

export const recordStyle = StyleSheet.create({
    rowBox: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#ffffff'
    },
    flexBox: {
        flex: 1,
        flexDirection: 'column',
    },
    InfoLeftItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 25,
        justifyContent: 'flex-start'
    },
    InfoRightItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 25,
        justifyContent: 'flex-end'
    },
    Info: {
        fontSize: 16,
        color: '#333',
    },
    minorInfo: {
        fontSize: 12,
        color: '#999',
        flexDirection: 'row',
        alignItems: 'center',
    },
    winPrize: {
        color: '#FF0033',
        fontWeight: 'bold'
    }
});

export const selectionStyles = StyleSheet.create({
    wrap: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    menuBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
        justifyContent: 'flex-start',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E3E3E3',
        backgroundColor: '#fff',
        paddingBottom: 15,
    },
    menuItem: {
        width: (width-80)/4,
        height: 23,
        marginTop: 15,
        marginRight: 20,
        borderColor: '#CECECE',
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    selectedIcon: {
        width: 13,
        height: 13,
        position: 'absolute',
        right: 0,
        bottom: 0,
        borderBottomRightRadius: 5,
    }
});
export const selectionBallArea = {
    container: {
        flex: 1,
        padding: 10,
    },
    titleBg: {
        width: 50,
        height: 21,
        justifyContent: 'center',
    },
    leftText: {
        width: width-20,
        fontSize: 12,
        marginHorizontal: 5,
        color: '#FFF',
    },
    selectionBox: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: 5,
    },
    ratio: {
        lineHeight: 20,
        textAlign: 'center',
        fontSize: 13,
        color: '#FF0000',
    },
    center: {
        justifyContent: 'center',
        alignItems:'center',
    },
    selectedBg: {
        backgroundColor: '#EC0909',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowColor: '#000',
        shadowRadius: 1,
    },
    number: StyleSheet.create({
        wrap: {
            marginTop: 15,
        },
        smallWrap: {
            width: (width-30)/5
        },
        largerWrap: {
            width: (width-30)/4
        },
        display: {
            width: 34,
            height: 34,
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: '#dedede',
            borderRadius: 17,
            borderWidth: StyleSheet.hairlineWidth,
        },
        displayText: {
            color: '#333',
            fontSize: 22,
            backgroundColor: 'transparent',
        },
        small: {
            width: 34,
            height: 34,
            borderRadius: 17,
        },
        larger: {
            width: 46,
            height: 46,
            borderRadius: 23,
        },
    }),
    string: StyleSheet.create({
        wrap: {
            marginVertical: 10,
            borderColor: '#dedede',
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: 5,
            paddingVertical: 5,

        },
        small: {
            width: 47,
            minHeight: 50,
            marginRight: (width - 265)/4,
        },
        middle: {
            width: 60,
            minHeight: 50,
            marginRight: (width - 270)/3,
        },
        larger: {
            width: 100,
            minHeight: 60,
            marginRight: (width - 330)/2,
        },
        display: {
            fontSize: 16,
        },
    }),
};