import React from 'react'
import Table from 'react-bootstrap/Table';

export const ParticipantsTable = ({participants}) => {

    const CustomerRow = (participant, index) => {

        return (
            <tr key={index} className='even'>
                <td> {index + 1} </td>
                <td>{participant.id}</td>
                <td>{participant.displayName}</td>
                {/*<td>{participant.email}</td>*/}
                {/*<td>{participant.address}</td>*/}
                {/*<td>{participant.zipcode}</td>*/}
            </tr>
        )
    };

    const CustomerTable = participants.map((parti, index) => CustomerRow(parti, index));

    const tableHeader = <thead className='bgvi'>
    <tr>
        <th>#</th>
        <th>編號</th>
        <th>使用者名稱</th>
        {/*<th>Email</th>*/}
        {/*<th>Address</th>*/}
        {/*<th>Zipcode</th>*/}
    </tr>
    </thead>;

    return (
        <Table striped bordered hover>
            {tableHeader}
            <tbody>
            {CustomerTable}
            </tbody>
        </Table>
    )
};