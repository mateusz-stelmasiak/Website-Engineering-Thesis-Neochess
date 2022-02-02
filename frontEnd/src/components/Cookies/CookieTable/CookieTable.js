import './CookieTable.css'
import {Table, Thead, Tbody, Tr, Th, Td} from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
import React from "react";


export default function CookieTable({cookies}) {
    const tabularizedCookies = cookies.map((cookie) => {
        return (
            <Tr>
                <Td>
                    {cookie.link !== null ?
                        <a href={cookie.link}>{cookie.name}</a> :
                        cookie.name
                    }
                </Td>
                <Td>{cookie.purpose}</Td>
                <Td>{cookie.party}</Td>
                <Td>{cookie.expiration}</Td>
            </Tr>
        );
    })

    return (
        <Table className='CookieTable'>
            <Thead>
                <Tr>
                    <Th>Cookie</Th>
                    <Th>Use</Th>
                    <Th>Cookie type</Th>
                    <Th>Expiration</Th>
                </Tr>
            </Thead>
            <Tbody>
                {tabularizedCookies}
            </Tbody>
        </Table>
    );
}