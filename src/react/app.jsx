import stampit from 'stampit'
import React from 'react';
import ReactDOM from 'react-dom';

import GLOBALS from '../config/globals'

export const App = stampit()
	.methods({})
	.init(function (a, {args, instance, stamp}) {
		Object.assign(instance, {
			functions: []
		})
		
		return ReactDOM.render(
			<Container />,
			document.getElementById('react')
		)
	});

class TowerContainer extends React.Component {
	constructor(props){
		super(props)
	}

	render(){
		return{

		}
	}
}

class Cell extends React.Component {
	constructor(props){
		super(props)
	}

	render(){
		return(
			<tr>
				<td>{this.props.text}:</td>
				<td>{this.props.value}</td>
			</tr>
		)
	}
}

class TowerInfo extends React.Component {
	render(){
		let data = this.props.tower

		if(Object.keys(data).length < 1){
			return (
				<ul></ul>
			)
		}
		return(
			<ul>
				<li>damage: {data.damage}</li>
				<li>level: {data.level}</li>
				<li>next level cost: {data.next}</li>
			</ul>
		)
	}
}
class StatsContainer extends React.Component {
	constructor(props){
		super(props)
	}

	render(){
		let stats = this.props.stats

		return(
			<tbody>
				<Cell text={'timer'} value={stats.timer} />
				<Cell text={'life'} value={stats.life} />
				<Cell text={'gold'} value={stats.gold} />
				<Cell text={'score'} value={stats.score} />
				<Cell text={'wave'} value={stats.wave} />
				<Cell text={'tile lock'} value={stats.tileLock} />
				<Cell text={'FPS'} value={stats.FPS} />
			</tbody>
		)
	}
}
class Container extends React.Component {
	constructor(props) {
		super(props);
		let locals = {
			FPS: 0,
			tower: {},
			timer: '--'
		}
		this.state = {...GLOBALS.player, ...GLOBALS.player.ui, ...locals}

		console.log(this.state)
	}

	componentDidMount() {
		// this.timerID = setInterval(
		//   () => this.tick(),
		//   1000
		// );
	}

	componentWillUnmount() {
		// clearInterval(this.timerID);
	}
	render() {
		return (
			<div>
				<div>
					<table>
						<StatsContainer stats={this.state} />
					</table>
				</div>

				<div>
					<TowerInfo  tower={this.state.tower}/>
				</div>
			</div>
		);
	}
}