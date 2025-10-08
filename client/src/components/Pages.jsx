import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { Context } from "../main";
import Pagination from "./Pagination";

const Pages = observer(() => {
    const { device } = useContext(Context);
    const currentPage = device.page;

    const pageCount = Math.ceil(device.totalCount / device.limit);
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

    const handlePageClick = (page) => {
        // Handle page navigation logic here
        device.setPage(page);
    };
    
    return (
        <Pagination>
            <Pagination.Prev 
                disabled={currentPage === 1}
                onClick={() => handlePageClick(currentPage - 1)}
            />
            {pages.map(page => 
                <Pagination.Item 
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageClick(page)}
                >
                    {page}
                </Pagination.Item>
            )}
            <Pagination.Next 
                disabled={currentPage === pages.length}
                onClick={() => handlePageClick(currentPage + 1)}
            />
        </Pagination>
    );
});

export default Pages;