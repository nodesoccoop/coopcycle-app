import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native'
import {
  Container, Header, Title, Content, Footer, FooterTab,
  Left, Right, Body,
  List, ListItem, Icon, Text, Button, Radio, Switch
} from 'native-base'
import { withNamespaces } from 'react-i18next'
import _ from 'lodash'
import { connect } from 'react-redux'

// import { changeStatus } from '../../redux/Restaurant/actions'

// FIXME Make sure ACCESS_COARSE_LOCATION is OK
// https://github.com/Polidea/react-native-ble-plx/issues/248

import { BleManager, State, fullUUID } from 'react-native-ble-plx'

class Printer extends Component {

  constructor(props) {
    super(props)

    this.bleManager = new BleManager()

    this.state = {
      bleState: State.Unknown,
      devices: [],
    }
  }

  componentDidMount() {

    // this.bleManager.state()
    //   .then((state) => this.setState({ bleState: state }))

    this.bleStateChangeSubscription = this.bleManager.onStateChange((state) => {
      console.log('BLE State = ' + state)
      this.setState({ bleState: state })
    }, true);
  }

  componentWillUnmount() {
    this.bleStateChangeSubscription.remove()
    this.bleManager.stopDeviceScan()
  }

  _connectToDevice(device) {
    device.connect()
      .then((device) => {
          console.log('BLE => Connected to device')
          return device.discoverAllServicesAndCharacteristics()
      })
      .then((device) => {

        device.services().then(services => {

          for (let s of services) {
            console.log('BLE service.uuid = ' + s.uuid)
            console.log('BLE service.uuid (full) = ' + fullUUID(s.uuid))

            // s.characteristics().then(characteristics => {
            //   for (let c of characteristics) {

            //     if (c.isReadable) {
            //       device.readCharacteristicForService(s.uuid, c.uuid)
            //         .then(readCharacteristic => {
            //           console.log('BLE characteristic READ value = ' + readCharacteristic.value)
            //         })
            //     }

            //     if (c.isWritableWithoutResponse) {
            //       console.log('BLE characteristic.id = ' + c.id)
            //       console.log('BLE characteristic.uuid = ' + c.uuid)
            //       console.log('BLE isNotifiable = ' + c.isNotifiable)
            //       console.log('BLE isIndicatable = ' + c.isIndicatable)
            //       console.log('BLE isWritableWithResponse = ' + c.isWritableWithResponse)
            //       console.log('BLE isWritableWithoutResponse = ' + c.isWritableWithoutResponse)
            //       console.log('BLE characteristic.value = ' + c.value)
            //       console.log('BLE ---')
            //     }

            //     if (c.uuid === 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f') {

            //       let encoder = new EscPosEncoder();
            //       let result = encoder
            //         .initialize()
            //         // .codepage('windows1252')
            //         .align('center')
            //         .line('Commande 123')
            //         .newline()
            //         .align('left')
            //         .line('Tarte aux pommes      12€')
            //         .line('Pizza                 10€')
            //         .newline()
            //         .newline()
            //         .encode();

            //       console.log('BLE ENCODED = ' + result)
            //       console.log('BLE BUFFER Base64 = ' + Buffer.from(result).toString('base64'))
            //       // console.log('BLE BUFFER B64 2 = ' + base64js.fromByteArray(result))
            //       // console.log('BLE BUFFER B64 3 = ' + base64ArrayBuffer(result.buffer))

            //       c.writeWithResponse(Buffer.from(result).toString('base64'))

            //     }
            //   }
            // })
          }
        })

      })
      .catch((error) => {
          // Handle errors
          console.log('BLE CONNECT ERROR', error)
      })
  }

  _scan() {
    // let devices = []
    this.bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
          console.log('BLE ERROR' + error)
          // Handle error (scanning will be stopped automatically)
          return
      }

      let devices = this.state.devices || []

      if (device.name) {

        console.log('BLE devices.length = ' + devices.length)

        // console.log('BLE device = ' + JSON.stringify(device))
        console.log('BLE device.id = ' + device.id)
        console.log('BLE device.name = ' + device.name)
        console.log('BLE device.localName = ' + device.localName)
        console.log('BLE device.serviceData = ' + JSON.stringify(device.serviceData))

        devices = devices.slice(0)

        if (!_.find(devices, d => d.id === device.id)) {

          console.log('BLE devices.push = ' + device.name)
          devices.push(device)
          this.setState({ devices })
        }
      }

    })

    setTimeout(() => {
      console.log('BLE stopSCAN')
      this.bleManager.stopDeviceScan()
    }, 10000);
  }

  renderItem(item) {

    return (
      <TouchableOpacity style={ styles.item } onPress={ () => this._connectToDevice(item) }>
        <Text>
          { item.name }
        </Text>
        <Icon type="FontAwesome" name="chevron-right" />
      </TouchableOpacity>
    )
  }

  render() {

    const { bleState } = this.state

    // const { navigate } = this.props.navigation
    // const { restaurants } = this.props

    // const openingHoursProps = {
    //   last: restaurants.length === 1
    // }
    // const changeRestaurantProps = {
    //   last: restaurants.length > 1
    // }

    return (
      <Container>
        <View style={{ paddingHorizontal: 10, paddingVertical: 20 }}>
          <Text style={{ textAlign: 'center' }}>
            HEADER
          </Text>
        </View>
        <Content style={ styles.content }>
          <FlatList
            data={ this.state.devices }
            keyExtractor={ item => item.id }
            renderItem={ ({ item }) => this.renderItem(item) } />
        </Content>
        { bleState === State.PoweredOn && (
        <Footer>
          <FooterTab>
            <Button full onPress={ this._scan.bind(this) }>
              <Text style={{ color: '#ffffff' }}>
                { this.props.t('SCAN_FOR_PRINTERS') }
              </Text>
            </Button>
          </FooterTab>
        </Footer>
        )}
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 20
  },
  item: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomColor: '#f7f7f7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})

function mapStateToProps(state) {
  return {
    httpClient: state.app.httpClient,
    restaurant: state.restaurant.restaurant,
    restaurants: state.restaurant.myRestaurants,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    changeStatus: (restaurant, state) => dispatch(changeStatus(restaurant, state)),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(withNamespaces('common')(Printer))
